import env from "../_constants.js";

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
            message: 'Error: "station" parameter not provided',
            example: `/api/fetchStation?station=${
                keys[Math.floor(Math.random() * keys.length)]
            }`,
            success: false,
        });
        return;
    }

    if (env.DEBUG) console.log(`Fetching station: ${stationName}`);

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
                message: `Station named "${stationName}" NOT found.`,
                success: false,
            });
        }
    } else {
        res.status(503);
        res.send({
            message: "Server is retrieving stations. Please wait.",
            success: false,
        });
    }
};
