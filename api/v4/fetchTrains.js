import { readFromDb } from "./_dbUtils.js";
import { handleDBError } from "../_utils.js";

const SCRIPT_NAME = "fetchTrains";

export default async (req, res) => {
    try {
        const dbResp = await readFromDb(SCRIPT_NAME, "trains");
        dbResp?.success
            ? res.send({ ...dbResp })
            : res.status(500).send({ ...dbResp });
    } catch (e) {
        handleDBError(res, e);
        return;
    }
};
