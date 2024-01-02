import { createClient } from "@vercel/postgres";
import env from "./_constants.js";
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

    let init_status = { db: true, scrapeStations: false, scrapeTrains: false };

    // fetch trains
    const serverUrl = req.rawHeaders[1];
    fetch(
        `http://${serverUrl}/api/v${env.API_VERSION}/scrapeTrains?token=${
            process.env[env.VERCEL_ENVS.PASSWORD_UPSTREAM_UPDATE]
        }`
    )
        .then((response) => response.json())
        .then((json) => {
            init_status.scrapeTrains = json.success;
        });

    // fetch stations
    await fetch(
        `http://${serverUrl}/api/v${env.API_VERSION}/scrapeStations?token=${
            process.env[env.VERCEL_ENVS.PASSWORD_UPSTREAM_UPDATE]
        }`
    )
        .then((response) => response.json())
        .then((json) => {
            init_status.scrapeStations = json.success;
        });

    console.log("init_status:", init_status);
    res.send({
        success: init_status,
    });
};
