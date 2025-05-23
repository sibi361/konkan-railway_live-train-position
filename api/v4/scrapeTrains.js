import { Agent } from "undici";
import crypto from "crypto";
import JSSoup from "jssoup";

import env from "../_constants.js";
import {
  authCheckScraper,
  handleUnauthorizedRequest,
  handleDBError,
} from "../_utils.js";
import { writeToDb } from "./_dbUtils.js";
import { writeToMongoDb } from "./_mongoUtils.js";

const jss = JSSoup.default;

const SCRIPT_NAME = "scrapeTrains";

export default async (req, res) => {
  const is_authorized = await authCheckScraper(req);
  if (!is_authorized) {
    handleUnauthorizedRequest(res);
    return;
  }

  if (env.DEBUG)
    console.log(`${SCRIPT_NAME}: Fetching trains data from upstream`);

  let data = {};
  try {
    const html = await fetch(env.UPSTREAM_URL, {
      dispatcher: new Agent({
        connect: {
          rejectUnauthorized: false,
          secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        },
      }),
    }).then((resp) => resp.text());

    const soup = new jss(html);

    ///////////////////

    const timeStampSpan = soup.find("span", {
      class: "lastupdatetext",
    });

    const timeSplit = timeStampSpan.text.trim().split(" ").slice(4, 6);
    const timeStamp = `${timeSplit[0].split("/").reverse().join("-")}T${
      timeSplit[1]
    }`;

    const currentTimeStamp = new Date(Date.parse(new Date()) + 19800000) // IST Offset
      .toISOString()
      .slice(0, 19);

    ///////////////////

    const hiddenInputs = soup.findAll("input", {
      type: "hidden",
    });
    const hiddenInputsLen = Object.keys(hiddenInputs).length;

    let hiddenInputsArr = [];
    for (let i = 0; i < hiddenInputsLen; i++)
      hiddenInputsArr.push(hiddenInputs[i.toString()]);

    ///////////////////

    const trainDataArr = hiddenInputsArr.filter((e) =>
      e.attrs.name.startsWith("trainData")
    );
    const statusArr = hiddenInputsArr.filter((e) =>
      e.attrs.name.startsWith("status")
    );
    const closedSationArr = hiddenInputsArr.filter((e) =>
      e.attrs.name.startsWith("closedSation")
    );
    const arrivedTimeArr = hiddenInputsArr.filter((e) =>
      e.attrs.name.startsWith("arrivedTime")
    );
    const lateTimeArr = hiddenInputsArr.filter((e) =>
      e.attrs.name.startsWith("lateTime")
    );
    const trainTypeArr = hiddenInputsArr.filter((e) =>
      e.attrs.name.startsWith("trainType")
    );
    const trainDirectionArr = hiddenInputsArr.filter((e) =>
      e.attrs.name.startsWith("trainDirection")
    );

    ///////////////////

    const trains = Array.from(trainDataArr).reduce((trains, trainData, i) => {
      const trainDataSplit = trainData?.attrs?.value?.split(" ");
      const number = trainDataSplit[0]
        .replaceAll("$", "-")
        .replaceAll("#", "-")
        .replaceAll("[", "-")
        .replaceAll("]", "-")
        .replaceAll("/", "-")
        .replaceAll(".", "-");
      const name = trainDataSplit.slice(1, -2).join(" ");
      const arrivedTimeSplit = arrivedTimeArr[i]?.attrs?.value?.split(":");
      const lateTimeSplit = lateTimeArr[i]?.attrs?.value?.split(":");

      const typeValue = trainTypeArr[i]?.attrs?.value
        ?.trim()
        .toLocaleUpperCase();
      let type;
      switch (typeValue) {
        case "EXP":
          type = "Express";
          break;
        case "SUP":
          type = "Superfast";
          break;
        case "ORD":
          type = "Passenger";
          break;
        case "RAJ":
          type = "Rajdhani";
          break;
        case "SHAT":
          type = "Shatabdi";
          break;
        case "ROR":
          type = "Goods";
          break;
        default:
          type = "UNKNOWN";
      }
      return {
        ...trains,
        [number]: {
          name,
          status: statusArr[i]?.attrs?.value?.toLocaleLowerCase(),
          station: closedSationArr[i]?.attrs?.value?.toLocaleLowerCase(),
          statusTime: {
            hours: arrivedTimeSplit[0],
            minutes: arrivedTimeSplit[1],
          },
          delayedTime: {
            hours: lateTimeSplit[0],
            minutes: lateTimeSplit[1],
          },
          type,
          direction: trainDirectionArr[i]?.attrs?.value
            ?.trim()
            .toLocaleLowerCase(),
        },
      };
    }, {});

    data = {
      lastFetchedAt: currentTimeStamp,
      lastUpdateAtUpstream: timeStamp,
      count: Object.keys(trains).length,
      trains,
    };

    if (env.DEBUG)
      console.log(`${SCRIPT_NAME}: Updated trains count: ${data.count}`);
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
    await writeToMongoDb(SCRIPT_NAME, data);

    const dbResp = await writeToDb(SCRIPT_NAME, "trains", data);
    dbResp?.success
      ? res.send({ ...dbResp })
      : res.status(500).send({ ...dbResp });
  } catch (e) {
    handleDBError(res, e);
    return;
  }
};
