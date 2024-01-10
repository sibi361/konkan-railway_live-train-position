# konkan-railway_live-train-position

This project provides a lightweight yet feature-rich, alternative frontend to the the [Konkan Railway Current Train Position](https://konkanrailway.com/VisualTrain/) website.

The frontend is powered by ReactJS and the backend runs on [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions) with [Google Firebase](https://firebase.google.com/docs/database) as the caching database.

Based on [sibi361/konkan-railway_api](https://github.com/sibi361/konkan-railway_api).

## Available Endpoints

Current API version: `4`

-   `/api/v4/fetchTrains`
    Returns live status about all the trains currently moving on the Konkan Railway

-   `/api/v4/fetchTrain/<TRAIN-NUMBER>`
    Returns an object containing information about the queried train such as - most recently touched station - arrived/departed time from that station - delay time i.e. whether the train is late or not

-   `/api/v4/fetchStations`
    Returns an object containing all the stations on the Konkan Railway route

-   `/api/v4/fetchStation/<STATION-PLACE-NAME>`
    Returns an object containing information about the queried station such as - type i.e. big station or small station - state - description

All endpoints return JSON containing a `success` flag and additionally two timestamps:

-   `lastFetchedAt`: Time when our scraping server pinged the upstream
-   `lastUpdateAtUpstream`: Time when the data on the upstream server was last updated

Additionally the version 2 API is available at `/api/v2`, for e.g. `/api/v2/fetchTrains`. Note that it is much slower than the version 4 API due to lack of upstream request caching.

## Setup

-   Clone this repository
    ```
    git clone https://github.com/sibi361/konkan-railway_live-train-position.git
    ```
-   Install [NodeJS](https://nodejs.org/en/download)
-   Install dependencies
    ```
    cd konkan-railway_live-train-position
    npm install
    ```

### Local Testing

-   Run the server
    ```
    npm run dev
    ```
-   Visit the site at the displayed URL

### Vercel Deployment

-   Vercel setup
    -   Create account
    -   Create team
    -   Click on the "Storage" tab and [create a Postgres database](https://vercel.com/docs/storage/vercel-postgres/quickstart)
    -   Generate a secret UUIDv4 token and add it as an environment variable in the "Environment Variables" settings page with the key name as `SECRET_UPSTREAM_UPDATE`
    -   Go to the Webhook settings located at `vercel[.]com/teams/<your-team-name>/settings/webhooks` and add a webhook for the `deployment.succeeded` event for this URL: `/api/v4/scrapeStations?token=<YOUR-SECRET_UPSTREAM_UPDATE-TOKEN>`
-   Google Firebase Setup
    -   Create a new project and then create a new Firebase Realtime Database at https://console.firebase.google.com/
        -   Set the permissions to private as we shall be using [Google OAuth](https://firebase.google.com/docs/database/rest/auth) to connect to the database
    -   Generate a new config JSON file at `https://console.firebase.google.com/project/<YOUR_PROJECT_NAME>/settings/serviceaccounts/adminsdk`
    -   Create a `_dbSecrets.js` file in `api/v4` using [`api/\_dbSecrets.js.example`](api/_dbSecrets.js.example) as a template and fill in the `private_key` and `client_email` from the JSON file obtained in the previous step
-   Install dependencies
    ```
    npm install
    ```
-   Pull environment variables locally
    ```
    vercel env pull .env.development.local
    ```
-   Test run the server
    ```
    vercel dev
    ```
-   Deploy
    ```
    vercel --prod
    ```
-   Visit the site at the displayed URL
-   Configure a web service / cron job to periodically ping the `/api/v4/scrapeTrains?token=<YOUR-SECRET_UPSTREAM_UPDATE-TOKEN>` endpoint to trigger an upstream update

## TODO

-   [x] Implement data caching in DB
-   [x] Migrate DB to Firebase
-   [ ] Build a frontend
-   [ ] Send PR to [public-api-lists](https://github.com/public-api-lists/public-api-lists)

## Changelog

-   `v4`: Migrated Scraper and Database
    -   Moved from browser based Playwright to [JSSoup](https://github.com/chishui/JSSoup); a JS fork of Beautiful Soup
    -   Switched caching database to Firebase Realtime Database thereby overcoming Vercel Postgres quota limits
-   `v3`: Added caching with Postgres DB
-   `v2`: Refactored code to host on Vercel Serverless Functions
-   `v1`: [sibi361/konkan-railway_api](https://github.com/sibi361/konkan-railway_api)

## Motivation

Due to poor network connectivity near most railway stations and during transit, the Current Train Position site with a size of ~250KB would take a long time to load.

When deployed on a cloud server, this API can instantly fetch the upstream site and send the required information to the client, consuming well under 1KB, hence leaving no chance for lag.

![postman_api_test_screenshot](./images/postman_screenshot.png)

~550 Bytes versus ~120KB, that too without the assets

![official_website_screenshot](./images/official_website_screnshot.png)

## Legal

This project is in no way affiliated or related to any railway or other company/organization, for e.g. Indian Railways. It is a completely independent and not-for-profit API built for educational purposes only.
