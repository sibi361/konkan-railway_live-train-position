import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get } from "firebase/database";
import env from "../_constants.js";

export default async (req, res) => {
    const firebaseConfig = {
        databaseURL: env.DB.FIREBASE_REALTIME_DATABASE_URL,
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    let data = {};

    const dbRef = ref(db);

    await get(child(dbRef, `/trains`)).then(
        (snapshot) => (data = { ...data, trains: { ...snapshot.val() } })
    );

    await get(child(dbRef, `/stations`)).then(
        (snapshot) => (data = { ...data, stations: { ...snapshot.val() } })
    );

    res.send({
        ...data,
    });
};
