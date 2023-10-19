# konkan-railway_train-position

This project provides a lightweight yet feature-rich, alternative frontend to the the [Konkan Railway Current Train Position](https://konkanrailway.com/VisualTrain/) website.

The frontend is powered by ReactJS and the backend runs on Vercel Serverless Functions while relying on Vercel Postgres for the caching database.

Based on [sibi361/konkan-railway_api](https://github.com/sibi361/konkan-railway_api).


## Available Endpoints

Current API version: `3`

- `/api/v3/fetchTrains`
    Returns live status about all the trains currently moving on the Konkan Railway

- `/api/v3/fetchTrain?tno=<TRAIN-NUMBER>`
    Returns an object containing information about the queried train such as
        - most recently touched station
        - arrived/departed time from that station
        - delay time i.e. whether the train is late or not

- `/api/v3/fetchStations`
    Returns an object containing all the stations on the Konkan Railway route

- `/api/v3/fetchStation?name=<STATION-PLACE-NAME>`
     Returns an object containing information about the queried station such as
        - type i.e. big station or small station
        - state
        - description

All endpoints return JSON containing a `success` flag and additionally two timestamps:

- `lastFetchedAt`: Time when our scraping server pinged the upstream
- `lastUpdateAtUpstream`: Time when the data on the upstream server was last updated

Additionally the version 2 API is available at `/api/v2`, for e.g. `/api/v2/fetchTrains`. Note that it is much slower than the version 3 API due to lack of upstream request caching.


## Setup


- Clone this repository
    ```
    git clone https://github.com/sibi361/konkan-railway_live-train-position.git
    ```
- Install [NodeJS](https://nodejs.org/en/download)
- Install dependencies
    ```
    cd konkan-railway_live-train-position
    npm install
    ```

### Local Testing

- Run the server
    ```
    npm run dev
    ```

### Vercel Deployment

- Vercel setup
    - Create account
    - Create team
    - Click on the "Storage" tab and [create a Postgres database](https://vercel.com/docs/storage/vercel-postgres/quickstart)
    - Go to the Webhook settings located at vercel[.]com/teams/&lt;your-team-name&gt;/settings/webhooks and add a webhook for the `deployment.succeeded` event that fetches the `/api/v3/initDb` endpoint
    - Add the secret token obtained above as an environment variable in the "Environment Variables" settings page with the name `SECRET_INIT_DB` and add another variable titled `SECRET_UPSTREAM_UPDATE` with a manually generated secret such as UUIDv4
- Install dependencies
    ```
    npm install
    ```
- Pull environment variables locally
    ```
    vercel env pull .env.development.local
    ```
- Test run the server
    ```
    vercel dev
    ```
- Deploy
    ```
    vercel
    ```
- Configure a service to ping the `/api/v3/scrapeTrains?token=<YOUR-SECRET_UPSTREAM_UPDATE-TOKEN>` endpoint periodically to fetch updates from upstream

If the endpoints error out on first run, the webhook call to `/api/v3/initDb` might have failed. This is a known bug caused due to the [ten second execution time limit](https://vercel.com/docs/functions/serverless-functions/runtimes#max-duration) for Vercel Serverless Functions on the free tier, inferred from the `FUNCTION_INVOCATION_TIMEOUT` error message.

Manually retry the call to `/api/v3/initDb` while passing the `SECRET_INIT_DB` token in to the `x-vercel-signature` header:
```
curl "<YOUR-ENDPOINT-URL>/api/v3/initDb" -H "x-vercel-signature: <YOUR-SECRET_INIT_DB-TOKEN>"
```


## TODO

- [x] Implement data caching in DB
- [ ] Migrate DB to Vercel Edge Config
- [ ] Appending `?latest` to the URL will trigger a manual update from the upstream provided the previous fetch is stale, i.e. more than X minutes ago
    - [ ] Implement rate limiting (https://vercel.com/docs/functions/edge-functions/vercel-edge-package#ipaddress)
- [ ] Build a frontend
- [ ] Send PR to [public-api-lists](https://github.com/public-api-lists/public-api-lists)


## Motivation

Due to poor network connectivity near most railway stations and during transit, the Current Train Position site with a size of ~250KB would take a long time to load.

When deployed on a cloud server, this API can instantly fetch the upstream site and send the required information to the client, consuming well under 1KB, hence leaving no chance for lag.

![postman_api_test_screenshot](./images/postman_screenshot.png)

~550 Bytes versus ~120KB, that too without the assets

![official_website_screenshot](./images/official_website_screnshot.png)


## Legal

This project is in no way affiliated or related to any railway or other company/organization, for e.g. Indian Railways. It is a completely independent and not-for-profit API built for educational purposes only.
