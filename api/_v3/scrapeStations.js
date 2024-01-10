import playwright from "playwright-aws-lambda";
import { devices } from "playwright-core";
import { createClient } from "@vercel/postgres";
import env from "./_constants.js";
import {
    authCheckScraper,
    handleUnauthorizedRequest,
    handleDBError,
    prepareJsonForDb,
} from "../_utils.js";

const SCRIPT_NAME = "scrapeStations";

export default async (req, res) => {
    const is_authorized = await authCheckScraper(req);
    if (!is_authorized) {
        handleUnauthorizedRequest(res);
        return;
    }

    if (env.DEBUG)
        console.log(`${SCRIPT_NAME}: Fetching stations data from upstream`);

    let data = {};
    try {
        data = await (async () => {
            const browser = await playwright.launchChromium(
                env.PLAYWRIGHT_OPTS
            );
            const UA = devices[env.PLAYWRIGHT_DEVICE];
            const context = await browser.newContext(UA);
            const page = await context.newPage();

            // disable assets loading to save bandwidth
            page.route("**/*", (route) => {
                if (route.request().resourceType() == "document")
                    route.continue();
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

                return {
                    stations,
                    count_stations: Object.keys(stations).length,
                };
            });

            await browser.close();
            if (env.DEBUG)
                console.log(
                    `${SCRIPT_NAME}: Stations count: ${response.count_stations}`
                );

            return response;
        })();
    } catch (e) {
        console.log(`# ERROR in ${SCRIPT_NAME}: ${e}`);
        if (env.DEBUG) {
            res.status(500).json({ error: e, success: false });
        } else {
            res.status(500).json({
                message: `${env.SERVER_ERROR_MESSAGE}/${SCRIPT_NAME}`,
                success: false,
            });
        }
        return;
    }

    const client = createClient();
    await client.connect();

    try {
        const query = `UPDATE ${
            env.DB.TABLE_NAME
        } SET VAL = '${prepareJsonForDb(data)}' WHERE KEY = '${
            env.DB.ROW_STATIONS
        }';`;
        await client.query(query);
    } catch (e) {
        handleDBError(res, e);
        return;
    }

    const response = { count_trains: data.count_stations, success: true };
    Object.keys(response).forEach((key) => res.setHeader(key, response[key]));
    res.send(response);
};
