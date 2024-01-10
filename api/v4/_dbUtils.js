// https://firebase.google.com/docs/database/rest/auth#node.js

import google from "googleapis";

import env from "../_constants.js";
import dbSecrets from "../_dbSecrets.js";

const SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/firebase.database",
];

const fetchDbToken = () =>
    new Promise((resolve, reject) => {
        const jwtClient = new google.Auth.JWT(
            dbSecrets.client_email,
            null,
            dbSecrets.private_key,
            SCOPES
        );

        jwtClient.authorize((err, tokens) => {
            if (err)
                reject({
                    success: false,
                    msg: err,
                });
            else
                resolve({
                    success: true,
                    token: tokens.access_token,
                });
        });
    });

export const writeToDb = async (script_name, path, data) => {
    const tokenFetcherResp = await fetchDbToken().catch((e) =>
        console.log(`# DB Auth Error: ${e}`)
    );

    if (!tokenFetcherResp.success)
        return {
            msg: tokenFetcherResp.msg,
            success: false,
        };

    const db_token = tokenFetcherResp.token;

    return await fetch(
        `${env.DB.FIREBASE_REALTIME_DATABASE_URL}/${path}.json`,
        {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${db_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    )
        .then((r) => r.json())
        .then((dbResponse) => {
            if (Object.keys(dbResponse).includes("error"))
                return {
                    dbResponse,
                    msg: `# ERROR in ${script_name}: DB connection failed`,
                    count: data.count,
                    success: false,
                };
            else
                return {
                    count: data.count,
                    success: true,
                };
        });
};

export const readFromDb = async (script_name, path) => {
    const tokenFetcherResp = await fetchDbToken().catch((e) =>
        console.log(`# DB Auth Error: ${e}`)
    );

    if (!tokenFetcherResp.success)
        return {
            msg: tokenFetcherResp.msg,
            success: false,
        };

    const db_token = tokenFetcherResp.token;

    return await fetch(
        `${env.DB.FIREBASE_REALTIME_DATABASE_URL}/${path}.json`,
        {
            headers: {
                Authorization: `Bearer ${db_token}`,
            },
        }
    )
        .then((r) => r.json())
        .then((dbResponse) => {
            if (Object.keys(dbResponse).includes("error"))
                return {
                    dbResponse,
                    msg: `# ERROR in ${script_name}: DB connection failed`,
                    success: false,
                };
            else
                return {
                    ...dbResponse,
                    success: true,
                };
        });
};
