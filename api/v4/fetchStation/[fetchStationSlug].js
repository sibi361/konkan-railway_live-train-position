import env from "../../_constants.js";
import { readFromDb } from "../_dbUtils.js";
import { handleDBError } from "../../_utils.js";

const SCRIPT_NAME = "fetchStation";

export default async (req, res) => {
    const stationName = req.query.fetchStationSlug
        .toLocaleLowerCase()
        .replaceAll("$", "-")
        .replaceAll("#", "-")
        .replaceAll("[", "-")
        .replaceAll("]", "-")
        .replaceAll("/", "-")
        .replaceAll(".", "-");

    let stationsData;
    try {
        stationsData = await readFromDb(SCRIPT_NAME, "stations");
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    const stations = stationsData?.stations;

    if (env.DEBUG)
        console.log(`${SCRIPT_NAME}: Fetching station: ${stationName}`);

    const data = stations.find((station) =>
        station.name.toLocaleLowerCase().includes(stationName)
    );

    if (data) {
        res.send({
            data,
            success: true,
        });
    } else {
        res.status(404);
        res.send({
            message: `Error: Station named "${stationName}" NOT found.`,
            success: false,
        });
    }
};
