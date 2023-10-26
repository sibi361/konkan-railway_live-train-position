import { createClient } from "@vercel/postgres";
import env from "./_constants.js";
import { handleDBError } from "../_utils.js";

const SCRIPT_NAME = "fetchStations";

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

    const data = await JSON.parse(result.rows[0]?.val);

    if (!data || !Object.keys(data)) {
        res.status(500).json({
            message: `${env.SERVER_ERROR_MESSAGE}/${SCRIPT_NAME}`,
            success: false,
        });
    } else
        res.send({
            ...data,
            success: true,
        });
};
