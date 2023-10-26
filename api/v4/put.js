import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, set, remove } from "firebase/database";
import env from "../_constants.js";

export default async (req, res) => {
    const firebaseConfig = {
        databaseURL: env.DB.FIREBASE_REALTIME_DATABASE_URL,
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const dbRef = ref(db);

    // await remove(dbRefT);
    // await remove(dbRefS);

    await set(child(dbRef, `/trains`), { 1: 2, 3: 4 });
    await set(child(dbRef, `/stations`), { 5: 6, 7: 8 });

    res.send({
        success: true,
    });
};
