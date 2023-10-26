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
        res.status(500);
        res.send({
            message: `${env.SERVER_ERROR_MESSAGE}/${SCRIPT_NAME}`,
            success: false,
        });
        return;
    }

    const keys = Object.keys(stationsData?.stations);

    const stationName = req.query.name?.toLocaleLowerCase();
    if (!stationName) {
        res.status(400);
        res.send({
            message: 'Error: "name" parameter not provided',
            example: `/api/fetchStation?name=${
                keys[Math.floor(Math.random() * keys.length)]
            }`,
            success: false,
        });
        return;
    }

    if (env.DEBUG)
        console.log(`${SCRIPT_NAME}: Fetching station: ${stationName}`);

    const key = keys.find((station) => station.includes(stationName));
    if (key)
        res.send({
            [key]: stationsData.stations[key],
            success: true,
        });
    else {
        res.status(404);
        res.send({
            message: `Error: Station named "${stationName}" NOT found.`,
            success: false,
        });
    }
};
