import playwright from "playwright-aws-lambda";
import { devices } from "playwright-core";

import env from "./_constants.js";

export default async (req, res) => {
    const data = await (async () => {
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
            const timeStampSpan = document.querySelector(".lastupdatetext");
            const timeSplit = timeStampSpan.textContent.split(" ").slice(4, 6);
            const timeStamp =
                `${timeSplit[0].split("/").reverse().join("-")}` +
                `T${timeSplit[1]}`;

            const data = { lastUpdatedAt: timeStamp };

            const trainDataArr = document.querySelectorAll(
                'input[type="hidden"][name^="trainData"]'
            );

            const statusArr = document.querySelectorAll(
                'input[type="hidden"][name^="status"]'
            );
            const statusArrLen = statusArr.length;

            const closedSationArr = document.querySelectorAll(
                'input[type="hidden"][name^="closedSation"]'
            );
            const closedSationArrLen = closedSationArr.length;

            const arrivedTimeArr = document.querySelectorAll(
                'input[type="hidden"][name^="arrivedTime"]'
            );
            const arrivedTimeArrLen = arrivedTimeArr.length;

            const lateTimeArr = document.querySelectorAll(
                'input[type="hidden"][name^="lateTime"]'
            );
            const lateTimeArrLen = lateTimeArr.length;

            const trainTypeArr = document.querySelectorAll(
                'input[type="hidden"][name^="trainType"]'
            );
            const trainTypeArrLen = trainTypeArr.length;

            const trainDirectionArr = document.querySelectorAll(
                'input[type="hidden"][name^="trainDirection"]'
            );
            const trainDirectionArrLen = trainDirectionArr.length;

            data.trains = Array.from(trainDataArr)
                .slice(0)
                .reduce((trains, trainData, i, inputArray) => {
                    // break if num(hidden inputs) < num(select options)
                    if (
                        i === statusArrLen ||
                        i === closedSationArrLen ||
                        i === arrivedTimeArrLen ||
                        i === lateTimeArrLen ||
                        i === trainTypeArrLen ||
                        i === trainDirectionArrLen
                    )
                        inputArray.splice(i); // https://stackoverflow.com/a/47441371

                    const trainDataSplit = trainData?.value.split(" ");
                    const number = trainDataSplit[0];
                    const name = trainDataSplit.slice(1, -2).join(" ");
                    const arrivedTimeSplit =
                        arrivedTimeArr[i]?.value.split(":");
                    const lateTimeSplit = lateTimeArr[i]?.value.split(":");

                    const typeValue = trainTypeArr[i]?.value
                        .trim()
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
                            type = typeValue;
                    }
                    return {
                        ...trains,
                        [number]: {
                            name,
                            status: statusArr[i]?.value.toLocaleLowerCase(),
                            station:
                                closedSationArr[i]?.value.toLocaleLowerCase(),
                            statusTime: {
                                hours: arrivedTimeSplit[0],
                                minutes: arrivedTimeSplit[1],
                            },
                            delayedTime: {
                                hours: lateTimeSplit[0],
                                minutes: lateTimeSplit[1],
                            },
                            type,
                            direction: trainDirectionArr[i]?.value
                                .trim()
                                .toLocaleLowerCase(),
                        },
                    };
                }, {});

            return { ...data, count_trains: Object.keys(data.trains).length };
        });

        await browser.close();
        if (env.DEBUG)
            console.log(
                `fetchTrains: Updated trains count: ${response.count_trains}`
            );

        return response;
    })();

    res.send({ ...data, success: true });
};
