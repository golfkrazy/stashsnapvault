import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";

import { SessionProvider } from "./context/SessionContext";
import "./styles/theme.css";

const App: React.FC = () => {
    return (
        <SessionProvider>
            <div style={{ height: "100%" }}>
                <RouterProvider router={router} />
            </div>
        </SessionProvider>
    );
};

export default App;
