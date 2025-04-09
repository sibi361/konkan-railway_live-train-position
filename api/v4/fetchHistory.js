import { readFromMongoDb } from "./_mongoUtils.js";
import { handleDBError } from "../_utils.js";
import env from "../_constants.js";

const SCRIPT_NAME = "fetchHistory";

export default async (req, res) => {
  try {
    const { trainNo, station, dayOfWeek, status, limit } = req.query;

    if (!trainNo || !station) {
      return res.status(400).send({ msg: "Missing required parameters." });
    }

    const maxLimitParsed = parseInt(env.HISTORY_MAX_RECORDS_ALLOWED);
    let limitParsed = parseInt(limit);
    if (limitParsed > maxLimitParsed) {
      limitParsed = maxLimitParsed;
    }

    const dbResp = await readFromMongoDb(
      SCRIPT_NAME,
      trainNo.trim(),
      station.trim(),
      dayOfWeek.trim(),
      status.trim(),
      limitParsed
    );

    dbResp?.success
      ? res.send({ count: dbResp.data.length, ...dbResp })
      : res.status(500).send({ ...dbResp });
  } catch (e) {
    handleDBError(res, e);
    return;
  }
};
