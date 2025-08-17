import React, { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Auth, retrieveToken, retrieveTokenDev } from "../../utils/auth/Auth";
import { ContextProvider } from "../contextProvider/ContextProvider";

const PrivateRoute = () => {
    const { userName } = useParams();

    const [token, setToken] = useState(null);

    /**
     * username is strictly a development var
     */
    useEffect(() => {
        if (userName && process.env.NODE_ENV !== "production") {
            retrieveTokenDev(0, userName).then((response) => {
                setToken(response);
            });
        } else if (process.env.NODE_ENV !== "production" && sessionStorage.getItem("devLogin") === "devLogin") {
            retrieveTokenDev(0, null).then((response) => {
                setToken(response);
            });
        } else {
            retrieveToken().then((response) => {
                setToken(response);
            });
        }
    }, [userName]);

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return token ? (
        <ContextProvider>
            <Outlet />
            <Auth />
        </ContextProvider>
    ) : (
        <Auth />
    );
};

export default PrivateRoute;
