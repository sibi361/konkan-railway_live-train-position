import { createClient } from "@vercel/postgres";
import env from "../_constants.js";
import { handleDBError } from "../_utils.js";

const SCRIPT_NAME = "fetchStation";

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

    const stationsData = await JSON.parse(result.rows[0]?.val);
    if (!stationsData || !stationsData?.stations) {
        res.status(500).json({
            message: `${env.SERVER_ERROR_MESSAGE}/${SCRIPT_NAME}`,
            success: false,
        });
        return;
    }

    const keys = Object.keys(stationsData?.stations);

    res.status(400).json({
        message: "Error: Station name parameter not provided",
        example: `/api/${SCRIPT_NAME}/${
            keys[Math.floor(Math.random() * keys.length)]
        }`,
        success: false,
    });
};
