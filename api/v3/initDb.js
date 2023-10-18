import { createClient } from "@vercel/postgres";
import {
    env,
    handleUnauthorizedRequest,
    handleDBError,
} from "../_constants.js";

const authCheckInitDb = async (req) => {
    if (req.headers["x-vercel-signature"]) {
        return (
            req.headers["x-vercel-signature"] ===
            process.env[env.VERCEL_ENVS.PASSWORD_INIT_DB]
        );
    }
    return false;
};

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

        query = `INSERT INTO ${env.DB.TABLE_NAME} VALUES ('${env.DB.ROW_LAST_UPDATED_TIME}','{}');`;
        await client.query(query);

        query = `INSERT INTO ${env.DB.TABLE_NAME} VALUES ('${env.DB.ROW_STATIONS}','{}');`;
        await client.query(query);

        query = `INSERT INTO ${env.DB.TABLE_NAME} VALUES ('${env.DB.ROW_TRAINS}','{}');`;
        await client.query(query);
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    res.send({
        message: "Database reset and initialized",
        success: true,
    });
};
