import { createClient } from "@vercel/postgres";
import { handleDBError } from "../_constants.js";

export default async (req, res) => {
    const client = createClient();
    await client.connect();

    let result = {};
    try {
        result =
            await client.sql`SELECT VAL FROM TB1 WHERE KEY = 'JSON_DATA_STATIONS';`;
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    res.send({ ...result.rows[0]["val"], success: true });
};
