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

// export const readFromDb = async (script_name, path) => {
//     const tokenFetcherResp = await fetchDbToken().catch((e) =>
//         console.log(`# DB Auth Error: ${e}`)
//     );

//     if (!tokenFetcherResp.success)
//         return {
//             msg: tokenFetcherResp.msg,
//             success: false,
//         };

//     const db_token = tokenFetcherResp.token;

//     return await fetch(
//         `${env.DB.FIREBASE_REALTIME_DATABASE_URL}/${path}.json`,
//         {
//             headers: {
//                 Authorization: `Bearer ${db_token}`,
//             },
//         }
//     )
//         .then((r) => r.json())
//         .then((dbResponse) => {
//             if (Object.keys(dbResponse).includes("error"))
//                 return {
//                     dbResponse,
//                     msg: `# ERROR in ${script_name}: DB connection failed`,
//                     success: false,
//                 };
//             else
//                 return {
//                     ...dbResponse,
//                     success: true,
//                 };
//         });
// };
