import env from "../../_constants.js";
import { readFromDb } from "../_dbUtils.js";
import { handleDBError } from "../../_utils.js";

const SCRIPT_NAME = "fetchStation";

export default async (req, res) => {
    const stationName = req.query.fetchStationSlug?.toLocaleLowerCase();

    let stationsData;
    try {
        stationsData = await readFromDb(SCRIPT_NAME, "stations");
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    const keys = Object.keys(stationsData?.stations);

    if (env.DEBUG)
        console.log(`${SCRIPT_NAME}: Fetching station: ${stationName}`);

    const key = keys.find((station) =>
        station.toLocaleLowerCase().includes(stationName)
    );
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
