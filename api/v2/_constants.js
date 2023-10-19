export default {
    DEBUG: false,
    UPSTREAM_URL: "https://konkanrailway.com/VisualTrain/",
    REPO_URL: "https://github.com/sibi361/konkan-railway_live-train-position",
    API_VERSION: 2,
    PLAYWRIGHT_OPTS: {
        headless: true,
        args: [
            "--disable-extensions",
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
};
