import { createClient } from "@vercel/postgres";
import env from "../_constants.js";
import { handleDBError } from "../_utils.js";

const SCRIPT_NAME = "fetchTrain";

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

    const trainsData = await JSON.parse(result.rows[0]?.val);
    if (!trainsData) {
        res.status(500);
        res.send({
            message: env.SERVER_ERROR_MESSAGE,
            success: false,
        });
    }

    const keys = Object.keys(trainsData?.trains);

    const trainNo = req.query.tno;
    if (!trainNo) {
        res.status(400);
        res.send({
            message: 'Error: "tno" parameter not provided',
            example: `/api/fetchTrain?tno=${
                keys[Math.floor(Math.random() * keys.length)]
            }`,
            success: false,
        });
        return;
    }

    if (env.DEBUG) console.log(`${SCRIPT_NAME}: Fetching train: ${trainNo}`);

    if (trainsData?.trains) {
        const data = {
            lastFetchedAt: trainsData.lastFetchedAt,
            lastUpdateAtUpstream: trainsData.lastUpdateAtUpstream,
        };

        if (keys.includes(trainNo))
            res.send({
                ...data,
                [trainNo]: trainsData.trains[trainNo],
                success: true,
            });
        else {
            res.status(404);
            res.send({
                ...data,
                message: `Error:Train number "${trainNo}" NOT found. It might not have started yet.`,
                success: false,
            });
        }
    } else {
        res.status(500);
        res.send({
            message: env.SERVER_ERROR_MESSAGE,
            success: false,
        });
    }
};
