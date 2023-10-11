import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <div>
            <h2>Konkan Railway API</h2>
            <p className="read-the-docs">
                API is available at&nbsp;
                <a href="./api/" target="_blank" rel="noreferrer">
                    /api/
                </a>
            </p>
            <p className="read-the-docs">
                Please visit the&nbsp;
                <a
                    href="https://github.com/sibi361/konkan-railway_api"
                    target="_blank"
                    rel="noreferrer"
                >
                    Github Repository
                </a>
                &nbsp;for API documentation
            </p>
        </div>
    </React.StrictMode>
);
