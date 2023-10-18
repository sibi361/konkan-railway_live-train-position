import { env } from "../_constants.js";

const SCRIPT_NAME = "fetchTrain";

export default async (req, res) => {
    const serverHostname = req.rawHeaders[1];
    const upstreamCacheRequest = await fetch(
        `http://${serverHostname}/api/v${env.API_VERSION}/fetchTrains`
    );
    const trainsData = await upstreamCacheRequest.json();

    const keys = Object.keys(trainsData?.trains);

    const trainNo = req.query.tno;
    if (!trainNo) {
        res.status(400);
        res.send({
            message: 'Error: "trainNo" parameter not provided',
            example: `/api/fetchTrain?trainNo=${
                keys[Math.floor(Math.random() * keys.length)]
            }`,
            success: false,
        });
        return;
    }

    if (env.DEBUG) console.log(`${SCRIPT_NAME}: Fetching train: ${trainNo}`);

    if (trainsData?.trains)
        if (keys.includes(trainNo))
            res.send({
                lastUpdatedAt: trainsData.lastUpdatedAt,
                [trainNo]: trainsData.trains[trainNo],
                success: true,
            });
        else {
            res.status(404);
            res.send({
                lastUpdatedAt: trainsData?.lastUpdatedAt,
                message: `Error:Train number "${trainNo}" NOT found. It might not have started yet.`,
                success: false,
            });
        }
    else {
        res.status(503);
        res.send({
            message: env.SERVER_ERROR_MESSAGE,
            success: false,
        });
    }
};
