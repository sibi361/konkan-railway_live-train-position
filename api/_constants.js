const env = {
  DEBUG: process.env.DEBUG ?? false,
  UPSTREAM_URL: "https://konkanrailway.com/VisualTrain/",
  REPO_URL: "https://github.com/sibi361/konkan-railway_live-train-position",
  API_VERSION: 4,
  PLAYWRIGHT_OPTS: { headless: true },
  PLAYWRIGHT_DEVICE: "Desktop Firefox",
  SERVER_ERROR_MESSAGE:
    "Server overloaded. Please wait or use the non-cached endpoint available at /api/v2",
  UNAUTHORIZED_ERROR_MESSAGE: "Unauthorized request: Token not supplied",
};

env.DB = {
  FIREBASE_REALTIME_DATABASE_URL:
    "https://kr-api-v4-default-rtdb.asia-southeast1.firebasedatabase.app",
};

env.VERCEL_ENVS = {
  PASSWORD_INIT_DB: "SECRET_INIT_DB",
  HEADER_NAME_WEBHOOK_INIT_DB: "x-vercel-signature",
  PASSWORD_UPSTREAM_UPDATE: "SECRET_UPSTREAM_UPDATE",
};

export default env;
