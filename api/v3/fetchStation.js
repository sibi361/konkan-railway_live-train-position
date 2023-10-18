import { env } from "../_constants.js";

const SCRIPT_NAME = "fetchStation";

export default async (req, res) => {
    const serverHostname = req.rawHeaders[1];
    const upstreamCacheRequest = await fetch(
        `http://${serverHostname}/api/v${env.API_VERSION}/fetchStations`
    );
    const stationsData = await upstreamCacheRequest.json();

    const keys = Object.keys(stationsData?.stations);

    const stationName = req.query.name?.toLocaleLowerCase();
    if (!stationName) {
        res.status(400);
        res.send({
            message: 'Error: "name" parameter not provided',
            example: `/api/fetchStation?name=${
                keys[Math.floor(Math.random() * keys.length)]
            }`,
            success: false,
        });
        return;
    }

    if (env.DEBUG)
        console.log(`${SCRIPT_NAME}: Fetching station: ${stationName}`);

    if (stationsData?.stations) {
        const key = keys.find((station) => station.includes(stationName));
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
    } else {
        res.status(503);
        res.send({
            message: env.SERVER_ERROR_MESSAGE,
            success: false,
        });
    }
};
