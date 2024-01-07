// https://firebase.google.com/docs/database/rest/auth#node.js

import google from "googleapis";

import dbSecrets from "../_dbSecrets.js";

const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/firebase.database",
];

export const fetchDbToken = () =>
    new Promise((resolve, reject) => {
        const jwtClient = new google.Auth.JWT(
            dbSecrets.client_email,
            null,
            dbSecrets.private_key,
            scopes
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
