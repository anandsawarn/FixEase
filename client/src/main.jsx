import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* <Provider >
      <App />
    </Provider> */}
    <App/>
  </React.StrictMode>
);

// // Measure performance if needed
// reportWebVitals(); // Optional: Pass a callback here to log or send data

