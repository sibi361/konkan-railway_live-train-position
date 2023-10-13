import playwright from "playwright-aws-lambda";
import { devices } from "playwright-core";

import env from "../api_static/constants.js";

export default async (req, res) => {
    if (env.DEBUG)
        console.log("fetchStations: Fetching stations data from upstream");

    const stationsData = await (async () => {
        const browser = await playwright.launchChromium(env.PLAYWRIGHT_OPTS);
        const UA = devices[env.PLAYWRIGHT_DEVICE];
        const context = await browser.newContext(UA);
        const page = await context.newPage();

        // disable assets loading to save bandwidth
        page.route("**/*", (route) => {
            if (route.request().resourceType() == "document") route.continue();
            else route.abort();
        });

        await page.goto(env.UPSTREAM_URL);

        const response = await page.evaluate(() => {
            const stationsSelectEle = document.querySelector("#stationId");
            const options = Array.from(
                stationsSelectEle.querySelectorAll("option")
            ).slice(1); // exclude header
            let stations = options.reduce(
                (stations, option) => ({
                    ...stations,
                    [option.textContent.trim().toLocaleLowerCase()]: {},
                }),
                {}
            );

            const stationTypeArr = document.querySelectorAll(
                'input[type="hidden"][name^="stationType"]'
            );
            const stationTypeArrLen = stationTypeArr.length;

            const stationStateArr = document.querySelectorAll(
                'input[type="hidden"][name^="stationState"]'
            );
            const stationStateArrLen = stationStateArr.length;

            const stationDescriptionArr = document.querySelectorAll(
                'input[type="hidden"][name^="stationDescription"]'
            );
            const stationDescriptionArrLen = stationDescriptionArr.length;

            const distanceArr = document.querySelectorAll(
                'input[type="hidden"][name^="distance"]'
            );
            const distanceArrLen = distanceArr.length;

            if (stations)
                stations = Object.keys(stations)
                    .slice(0)
                    .reduce((stationsObj, stName, i, inputArray) => {
                        // break if num(hidden inputs) < num(select options)
                        if (
                            i === stationTypeArrLen ||
                            i === stationStateArrLen ||
                            i === stationDescriptionArrLen ||
                            i === distanceArrLen
                        )
                            inputArray.splice(i); // https://stackoverflow.com/a/47441371

                        const stateValue = stationStateArr[i]?.value
                            .trim()
                            .toLocaleLowerCase();
                        let state;
                        switch (stateValue) {
                            case "m":
                                state = "Maharashtra";
                                break;
                            case "g":
                                state = "Goa";
                                break;
                            case "k":
                                state = "Karnataka";
                                break;
                            default:
                                state = stateValue;
                        }

                        return {
                            ...stationsObj,
                            [stName]: {
                                type: stationTypeArr[i]?.value
                                    .trim()
                                    .toLocaleLowerCase(),
                                state,
                                description:
                                    stationDescriptionArr[i]?.value.trim(),
                                distance: distanceArr[i]?.value.trim(),
                            },
                        };
                    }, stations);

            return { stations, count_stations: Object.keys(stations).length };
        });

        await browser.close();
        if (env.DEBUG)
            console.log(
                `fetchStations: Stations count: ${response.count_stations}`
            );

        return response;
    })();

    const keys = Object.keys(stationsData?.stations);

    const stationName = req.query.station?.toLocaleLowerCase();
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
