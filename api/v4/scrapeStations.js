import JSSoup from "jssoup";

import env from "../_constants.js";
import {
    authCheckScraper,
    handleUnauthorizedRequest,
    handleDBError,
} from "../_utils.js";
import { writeToDb } from "./_dbUtils.js";

const jss = JSSoup.default;

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
        const html = await fetch(env.UPSTREAM_URL).then((resp) => resp.text());

        const soup = new jss(html);

        ///////////////////

        const stationsOptions = Array.from(
            soup.find("select", {
                id: "stationId",
            }).descendants
        ).slice(1);

        const stArr = stationsOptions
            .map((option) => option.text)
            .filter((s) => s !== undefined);

        ///////////////////

        const hiddenInputs = soup.findAll("input", {
            type: "hidden",
        });
        const hiddenInputsLen = Object.keys(hiddenInputs).length;

        let hiddenInputsArr = [];
        for (let i = 0; i < hiddenInputsLen; i++)
            hiddenInputsArr.push(hiddenInputs[i.toString()]);

        ///////////////////

        const stationTypeArr = hiddenInputsArr.filter((e) =>
            e.attrs.name.startsWith("stationType")
        );
        const stationStateArr = hiddenInputsArr.filter((e) =>
            e.attrs.name.startsWith("stationState")
        );
        const stationDescriptionArr = hiddenInputsArr.filter((e) =>
            e.attrs.name.startsWith("stationDescription")
        );
        const distanceArr = hiddenInputsArr.filter((e) =>
            e.attrs.name.startsWith("distance")
        );

        ///////////////////

        const stations = stArr.reduce((obj, stName, i) => {
            const name = stName
                .replaceAll("$", "-")
                .replaceAll("#", "-")
                .replaceAll("[", "-")
                .replaceAll("]", "-")
                .replaceAll("/", "-")
                .replaceAll(".", "-");

            const stateValue = stationStateArr[i]?.attrs?.value
                ?.trim()
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
                ...obj,
                [name]: {
                    type: stationTypeArr[i]?.attrs?.value
                        ?.trim()
                        .toLocaleLowerCase(),
                    state,
                    description: stationDescriptionArr[i]?.attrs?.value?.trim(),
                    distance: distanceArr[i]?.attrs?.value?.trim(),
                },
            };
        }, {});

        ///////////////////

        data = { count: Object.keys(stations).length, stations };

        if (env.DEBUG)
            console.log(`${SCRIPT_NAME}: Stations count: ${data.count}`);
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

    try {
        const dbResp = await writeToDb(SCRIPT_NAME, "stations", data);
        dbResp?.success
            ? res.send({ ...dbResp })
            : res.status(500).send({ ...dbResp });
    } catch (e) {
        handleDBError(res, e);
        return;
    }
};
