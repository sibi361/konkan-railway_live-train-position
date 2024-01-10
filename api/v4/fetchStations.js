import { readFromDb } from "./_dbUtils.js";
import { handleDBError } from "../_utils.js";

const SCRIPT_NAME = "fetchStations";

export default async (req, res) => {
    try {
        const dbResp = await readFromDb(SCRIPT_NAME, "stations");
        dbResp?.success
            ? res.send({ ...dbResp })
            : res.status(500).send({ ...dbResp });
    } catch (e) {
        handleDBError(res, e);
        return;
    }
};
