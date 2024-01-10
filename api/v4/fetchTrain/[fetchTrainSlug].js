import env from "../../_constants.js";
import { readFromDb } from "../_dbUtils.js";
import { handleDBError } from "../../_utils.js";

const SCRIPT_NAME = "fetchTrain";

export default async (req, res) => {
    const trainNo = req.query.fetchTrainSlug
        .replaceAll("$", "-")
        .replaceAll("#", "-")
        .replaceAll("[", "-")
        .replaceAll("]", "-")
        .replaceAll("/", "-")
        .replaceAll(".", "-");

    let trainsData;
    try {
        trainsData = await readFromDb(SCRIPT_NAME, "trains");
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    const keys = Object.keys(trainsData?.trains);

    if (env.DEBUG) console.log(`${SCRIPT_NAME}: Fetching train: ${trainNo}`);

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
            message: `Error: Train number "${trainNo}" NOT found. It might not have started yet.`,
            success: false,
        });
    }
};
