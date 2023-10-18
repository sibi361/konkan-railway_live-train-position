# konkan-railway_train-position

This project provides a lightweight yet feature-rich, alternative frontend to the the [Konkan Railway Current Train Position](https://konkanrailway.com/VisualTrain/) website.

The frontend is powered by ReactJS and the backend runs on Vercel Serverless Functions while relying on Vercel Postgres for the caching database.

Based on [sibi361/konkan-railway_api](https://github.com/sibi361/konkan-railway_api).


## Available Endpoints

- `/api/fetchTrains/`
    Returns live status about all the trains currently moving on the Konkan Railway

- `/api/fetchTrain?tno=<TRAIN-NUMBER>`
    Returns an object containing information about the queried train such as
        - most recently touched station
        - arrived/departed time from that station
        - delay time i.e. whether the train is late or not

- `/api/fetchStations/`
    Returns an object containing all the stations on the Konkan Railway route

- `/api/fetchStation?name=<STATION-PLACE-NAME>`
     Returns an object containing information about the queried station such as
        - type i.e. big station or small station
        - state
        - description

All endpoints return JSON containing a `success` flag and additionally two timestamps:

- `lastFetchedAt`: Time when our scraping server pinged the upstream
- `lastUpdateAtUpstream`: Time when the data on the upstream server was last updated


## TODO

- [x] Implement data caching in DB
- [ ] Appending `?latest` to the URL will trigger a manual update from the upstream provided the previous fetch was more than x minutes ago
- [ ] Implement rate limiting (https://vercel.com/docs/functions/edge-functions/vercel-edge-package#ipaddress)
- [ ] Build a frontend
- [ ] Send PR to [public-api-lists](https://github.com/public-api-lists/public-api-lists) after hosting on a stable cloud as azure keeps suspending this API since it's currently running on free tier
- [ ] Setup Vercel cron job for periodic upstream fetching: Unreliable on free tier


## Motivation

Due to poor network connectivity near most railway stations and during transit, the Current Train Position site with a size of ~250KB would take a long time to load.

When deployed on a cloud server, this API can instantly fetch the upstream site and send the required information to the client, consuming well under 1KB, hence leaving no chance for lag.

![postman_api_test_screenshot](./images/postman_screenshot.png)

~550 Bytes versus ~120KB, that too without the assets

![official_website_screenshot](./images/official_website_screnshot.png)


## Legal

This project is in no way affiliated or related to any railway or other company/organization, for e.g. Indian Railways. It is a completely independent and not-for-profit API built for educational purposes only.
