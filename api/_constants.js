export const env = {
    DEBUG: true,
    UPSTREAM_REFRESH_INTERVAL: 300,
    UPSTREAM_URL: "https://konkanrailway.com/VisualTrain/",
    REPO_URL: "https://github.com/sibi361/konkan-railway_live-train-position",
    API_VERSION: 3,
    PLAYWRIGHT_OPTS: {
        headless: true,
        args: [
            "--disable-extensions",
            "--disable-background-networking",
            "--disable-default-apps",
            "--disable-gpu",
            "--disable-sync",
            "--disable-translate",
            "--no-first-run",
            "--incognito",
            "--safebrowsing-disable-auto-update",
        ],
    },
    PLAYWRIGHT_DEVICE: "Desktop Firefox",
    SERVER_ERROR_MESSAGE: "Server overloaded. Please wait.",
    UNAUTHORIZED_ERROR_MESSAGE: "Unauthorized request: API Key not supplied",
};

env.DB = {
    TABLE_NAME: `KONKAN_RAILWAY_API_V${env.API_VERSION}_TB1`,
    ROW_LAST_UPDATED_TIME: "DB_LAST_UPDATED",
    ROW_STATIONS: "JSON_DATA_STATIONS",
    ROW_TRAINS: "JSON_DATA_TRAINS",
};

env.VERCEL_ENVS = {
    PASSWORD_INIT_DB: "SECRET_INIT_DB",
    PASSWORD_UPSTREAM_UPDATE: "SECRET_UPSTREAM_UPDATE",
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
    if (env.DEBUG) response.send({ message: errorMsg, success: false });
    else response.send({ message: env.SERVER_ERROR_MESSAGE, success: false });
};

export const prepareJsonForDb = (json) => {
    return JSON.stringify(json).toString().replaceAll("'", "");
};
