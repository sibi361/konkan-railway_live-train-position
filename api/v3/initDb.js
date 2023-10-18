import { createClient } from "@vercel/postgres";
import env from "../_constants.js";
import {
    authCheckInitDb,
    handleUnauthorizedRequest,
    handleDBError,
} from "../_utils.js";

export default async (req, res) => {
    const is_authorized = await authCheckInitDb(req);
    if (!is_authorized) {
        handleUnauthorizedRequest(res);
        return;
    }

    const client = createClient();
    await client.connect();

    let query;
    try {
        query = `DROP TABLE IF EXISTS ${env.DB.TABLE_NAME};`;
        await client.query(query);

        query = `CREATE TABLE IF NOT EXISTS ${env.DB.TABLE_NAME} (KEY TEXT UNIQUE, VAL TEXT);`;
        await client.query(query);

        query = `INSERT INTO ${env.DB.TABLE_NAME} VALUES ('${env.DB.ROW_STATIONS}','{}');`;
        await client.query(query);

        query = `INSERT INTO ${env.DB.TABLE_NAME} VALUES ('${env.DB.ROW_TRAINS}','{}');`;
        await client.query(query);
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    // fetch stations
    const serverUrl = req.rawHeaders[1];
    await fetch(
        `http://${serverUrl}/api/v${env.API_VERSION}/scrapeStations?token=${
            process.env[env.VERCEL_ENVS.PASSWORD_UPSTREAM_UPDATE]
        }`
    )
        .then((response) => response.json())
        .then((json) =>
            json.success
                ? {}
                : res.send({
                      message:
                          "Database initialized but initial stations fetch failed",
                      success: false,
                  })
        );

    // fetch trains
    await fetch(
        `http://${serverUrl}/api/v${env.API_VERSION}/scrapeTrains?token=${
            process.env[env.VERCEL_ENVS.PASSWORD_UPSTREAM_UPDATE]
        }`
    )
        .then((response) => response.json())
        .then((json) =>
            json.success
                ? res.send({
                      message:
                          "Database initialized and inital fetch successful",
                      success: true,
                  })
                : res.send({
                      message:
                          "Database initialized but initial trains fetch failed",
                      success: false,
                  })
        );
};
