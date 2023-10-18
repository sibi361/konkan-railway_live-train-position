import { createClient } from "@vercel/postgres";
import { env, handleDBError } from "../_constants.js";

export default async (req, res) => {
    const client = createClient();
    await client.connect();

    let result = {};
    try {
        const query = `SELECT VAL FROM ${env.DB.TABLE_NAME} WHERE KEY = '${env.DB.ROW_STATIONS}';`;
        result = await client.query(query);
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    res.send({
        ...JSON.parse(result.rows[0]?.val),
        success: true,
    });
};
