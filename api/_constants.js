const env = {
    DEBUG: true,
    UPSTREAM_URL: "https://konkanrailway.com/VisualTrain/",
    REPO_URL: "https://github.com/sibi361/konkan-railway_live-train-position",
    API_VERSION: 3,
    PLAYWRIGHT_OPTS: {
        headless: true,
    },
    PLAYWRIGHT_DEVICE: "Desktop Firefox",
    SERVER_ERROR_MESSAGE: "Server overloaded. Please wait.",
    UNAUTHORIZED_ERROR_MESSAGE: "Unauthorized request: Token not supplied",
};

env.DB = {
    TABLE_NAME: `KONKAN_RAILWAY_API_V${env.API_VERSION}_TB1`,
    ROW_STATIONS: "JSON_DATA_STATIONS",
    ROW_TRAINS: "JSON_DATA_TRAINS",
};

env.VERCEL_ENVS = {
    PASSWORD_INIT_DB: "SECRET_INIT_DB",
    HEADER_NAME_WEBHOOK_INIT_DB: "x-vercel-signature",
    PASSWORD_UPSTREAM_UPDATE: "SECRET_UPSTREAM_UPDATE",
};

export default env;
