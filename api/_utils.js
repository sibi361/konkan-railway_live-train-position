import env from "./_constants.js";

export const authCheckInitDb = async (req) => {
    if (
        process.env[env.VERCEL_ENVS.PASSWORD_INIT_DB] &&
        req.headers[env.VERCEL_ENVS.HEADER_NAME_WEBHOOK_INIT_DB]
    ) {
        return (
            process.env[env.VERCEL_ENVS.PASSWORD_INIT_DB] ===
            req.headers[env.VERCEL_ENVS.HEADER_NAME_WEBHOOK_INIT_DB]
        );
    }
    return false;
};

export const authCheckScraper = async (req) => {
    if (process.env[env.VERCEL_ENVS.PASSWORD_UPSTREAM_UPDATE]) {
        // const token = req.headers.authorization?.split(" ")[1];
        const url = req.url;
        const token = url
            .slice(url.indexOf("?") + 1)
            .split("&")[0]
            .split("=")[1];
        if (!token) return false;
        return process.env[env.VERCEL_ENVS.PASSWORD_UPSTREAM_UPDATE] === token;
    }
    return false;
};

export const handleUnauthorizedRequest = (response) => {
    if (env.DEBUG)
        console.log(
            "# handleUnauthorizedRequest: Blocked unauthorized request"
        );
    response.status(403);
    response.send({ message: env.UNAUTHORIZED_ERROR_MESSAGE, success: false });
};

export const handleDBError = (response, errorMsg) => {
    response.status(500);
    console.log(`# DB Error: ${errorMsg}`);
    if (env.DEBUG) {
        response.status(500);
        response.send({ error: errorMsg, success: false });
    } else
        response.send({
            message: `${env.SERVER_ERROR_MESSAGE}`,
            success: false,
        });
};
