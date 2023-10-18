import { createClient } from "@vercel/postgres";
import { env, handleDBError } from "../_constants.js";

export default async (req, res) => {
    const client = createClient();
    await client.connect();

    let result = {};
    try {
        const query = `SELECT VAL FROM ${env.DB.TABLE_NAME} WHERE KEY = '${env.DB.ROW_TRAINS}';`;
        result = await client.query(query);
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    const data = JSON.parse(result.rows[0]?.val);

    if (Object.keys(data).length == 0)
        res.send({
            message: env.SERVER_ERROR_MESSAGE,
            success: false,
        });
    else
        res.send({
            ...data,
            success: true,
        });
};
