import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/privateRoute/PrivateRoute";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import LoadTest from "./components/LoadTest";
import Home from "./segments/Home";
import Numbers from "./segments/Numbers";
import Students from "./segments/Students";
import Timeline from "./segments/Timeline";
import Requests from "./segments/Requests";

/**
 * Routing for the DUO Bypass Login
 * @name App
 * @return {{}}
 */
const App = () => {
    return (
        <Routes>
            <Route path="/" element={<PrivateRoute />}>
                <Route path="/" element={<Home />} />
            </Route>
            <Route path="/home" element={<PrivateRoute />}>
                <Route path="/home" element={<Home />} />
            </Route>
            <Route path="/choices" element={<PrivateRoute />}>
                <Route path="/choices" element={<Requests />} />
            </Route>
            <Route path="/choices" element={<PrivateRoute />}>
                <Route path="/choices" element={<NotFound />} />
            </Route>
            <Route path="/numbers" element={<PrivateRoute />}>
                <Route path="/numbers" element={<Numbers />} />
            </Route>
            <Route path="/students" element={<PrivateRoute />}>
                <Route path="/students" element={<Students />} />
            </Route>
            <Route path="/timeline" element={<PrivateRoute />}>
                <Route path="/timeline" element={<Timeline />} />
            </Route>
            <Route path="/notFound" element={<NotFound />} />
            <Route default element={<NotFound />} />
            {/* Development ONLY */}
            {process.env.NODE_ENV !== "production" && (
                <>
                    <Route path="/backdoor" exact element={<Login />} />
                    <Route path="/layout" element={<Layout />} />

                    <Route path="/loadtest" exact element={<NotFound />} />

                    <Route path="/loadtest/:userName" exact element={<PrivateRoute />}>
                        <Route path="/loadtest/:userName" exact element={<LoadTest />} />
                    </Route>
                </>
            )}
        </Routes>
    );
};

export default App;
