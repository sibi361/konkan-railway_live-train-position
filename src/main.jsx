import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/styles.css";
import env from "./constants.js";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <div>
            <h1>Konkan Railway Live Train Position</h1>
            <p className="read-the-docs">
                Please visit the&nbsp;
                <a href={env.REPO_URL} target="_blank" rel="noreferrer">
                    Github Repository
                </a>
                &nbsp;for API documentation
            </p>
            <p className="read-the-docs">
                <a href={env.STATUS_PAGE_URL} target="_blank" rel="noreferrer">
                    API Status
                </a>
            </p>
        </div>
    </React.StrictMode>
);
