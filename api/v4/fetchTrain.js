import env from "../_constants.js";
import { readFromDb } from "./_dbUtils.js";
import { handleDBError } from "../_utils.js";

const SCRIPT_NAME = "fetchTrain";

export default async (req, res) => {
    let trainsData;
    try {
        trainsData = await readFromDb(SCRIPT_NAME, "trains");
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    const keys = Object.keys(trainsData?.trains);

    res.status(400);
    res.send({
        message: "Error: Train number parameter not provided",
        example: `https://${req.headers?.host}/api/v${
            env.API_VERSION
        }/${SCRIPT_NAME}/${keys[Math.floor(Math.random() * keys.length)]}`,
        success: false,
    });
};
