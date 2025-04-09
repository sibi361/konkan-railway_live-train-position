import mongoose from "mongoose";
import env from "../_constants.js";
import Trains from "../../models/trains.js";

let cached = {
  conn: null,
  promise: null,
};

const MONGODB_URI = env.DB.MONGODB_URI || "mongodb://localhost:27017/revels";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

async function connectToDb() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      serverSelectionTimeoutMS: 30000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongoose) => mongoose);

    // console.log("Connected to MongoDB");
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export const writeToMongoDb = async (script_name, scrapedData) => {
  try {
    await connectToDb();

    const data = {
      ...scrapedData,
      trains: Object.keys(scrapedData.trains).map((trainNo) => ({
        trainNo,
        ...scrapedData.trains[trainNo],
      })),
    };

    await Trains.create(data);

    return {
      count: data.count,
      success: true,
    };
  } catch (error) {
    console.error(`# DB Error: ${error}`);
    return {
      msg: `# ERROR in ${script_name}: DB connection failed`,
      success: false,
    };
  }
};

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const readFromMongoDb = async (
  script_name,
  trainNo,
  station,
  dayOfWeek,
  status = undefined,
  limit = 7
) => {
  try {
    await connectToDb();

    const dayOfWeekNum =
      DAYS_OF_WEEK.findIndex((day) => day === dayOfWeek?.toLowerCase()) + 1;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const documents = await Trains.aggregate([
      {
        $match: {
          trains: {
            $elemMatch: status
              ? {
                  trainNo,
                  station,
                  status,
                }
              : {
                  trainNo,
                  station,
                },
          },
          ...(dayOfWeekNum
            ? {
                $expr: {
                  $eq: [{ $dayOfWeek: "$createdAt" }, dayOfWeekNum],
                },
              }
            : {}),
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          count: 1,
          createdAt: 1,
          train: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$trains",
                  as: "train",
                  cond: {
                    $and: [
                      { $eq: ["$$train.trainNo", trainNo] },
                      { $eq: ["$$train.station", station] },
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ]);

    return {
      success: true,
      data: removeDuplicateTrains(documents),
    };
  } catch (error) {
    console.error(`# Mongo Error: ${error}`);
    return {
      msg: `# ERROR in ${script_name}: DB connection failed`,
      success: false,
    };
  }
};

export function removeDuplicateTrains(data) {
  const seenTrainKeys = new Set();
  const filteredData = [];

  data.forEach((item) => {
    const creationDate = new Date(item.createdAt);
    const creationDateString = creationDate.toISOString().split("T")[0]; // Get only the date part

    const trainKey = `${creationDateString}-${item.train.trainNo}-${item.train.station}-${item.train.statusTime.hours}-${item.train.statusTime.minutes}`;

    if (!seenTrainKeys.has(trainKey)) {
      seenTrainKeys.add(trainKey);
      filteredData.push(item);
    }
  });

  return filteredData;
}
