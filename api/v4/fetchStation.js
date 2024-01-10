import env from "../_constants.js";
import { readFromDb } from "./_dbUtils.js";
import { handleDBError } from "../_utils.js";

const SCRIPT_NAME = "fetchStation";

export default async (req, res) => {
    let stationsData;
    try {
        stationsData = await readFromDb(SCRIPT_NAME, "stations");
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    const keys = Object.keys(stationsData?.stations);

    res.status(400).json({
        message: "Error: Station name parameter not provided",
        example: `https://${req.headers?.host}/api/v${
            env.API_VERSION
        }/${SCRIPT_NAME}/${keys[Math.floor(Math.random() * keys.length)]}`,
        success: false,
    });
};
