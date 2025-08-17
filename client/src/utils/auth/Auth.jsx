import { useEffect, useContext, useState } from "react";
import axios from "axios";
import {
    EXPIRY_BUFFER_MILLI,
    SAML_LOGOUT_URL,
    SERVICE_HOST,
    START_SESSION_URL,
    TOKEN_EXPIRY_CHECK_MILLI,
    TOKEN_URL,
    TOKEN_URL_DEV
} from "./config";
import { GlobalContext } from "../../components/contextProvider/ContextProvider";
import { getDateFromEpoch } from "../DateFormatter";

/**
 * Token Object that lives in memory.
 */
let inMemoryToken;
let retrievedFlag = true;

/**
 * This is to store the inMemoryToken Object.
 * @name storeToken
 * @param jwtToken
 * @param expiryEpochMilli
 * @param expiryDate
 * @param tokenType
 * @param username
 * @param guid
 */
const storeToken = ({ jwt, expiryEpochMilli, expiryDate, tokenType, username, guid }) => {
    inMemoryToken = {
        token: jwt,
        expiry: expiryEpochMilli < 1000000000000 ? parseInt(expiryEpochMilli, 10) * 1000 : expiryEpochMilli,
        readableExpiry: expiryDate,
        username,
        guid,
        tokenType
    };
};

/**
 * Obliterate inMemoryToken and user_details session
 * @name fakeLogout
 * @returns {Promise<void>}
 */
const fakeLogout = async () => {
    inMemoryToken = null;
    // remove the user session
    sessionStorage.removeItem("user_details");
};

/**
 * Logout function that logs people out of active tabs and redirect logout for SAML.
 * @name logout
 * @returns {Promise<void>}
 */
async function logout() {
    inMemoryToken = null;
    // remove all sessionStorage
    sessionStorage.clear();
    // to support logging out from all windows
    // TODO: set sessionStorage item with date
    sessionStorage.setItem("logout", Date.now());
    // TODO: WE don't have a api/logout that returns back. Instead just do a saml/logout redirect
    window.location.replace(SAML_LOGOUT_URL);
}

/**
 * This is to capture specific responses from API calls.
 */
// TODO: Add 500 service error to retry 3 times.
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error && error.response) {
            if (error.response.status === 401) window.location.replace(START_SESSION_URL);
            return Promise.reject(error.response);
        }
        return Promise.reject(error);
    }
);

/**
 * Manually decode a token into our format
 * @name parseJwt
 * @param {string} token
 * @return {{}} jsonPayload
 */
const parseJwt = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        window
            .atob(base64)
            .split("")
            .map((c) => {
                const sliceString = `00${c.charCodeAt(0).toString(16)}`.slice(-2);
                return `%${sliceString}`;
            })
            .join("")
    );

    return JSON.parse(jsonPayload);
};

/**
 * This uses Axios library to call the token service.
 * @name retrieveTokenDev
 * @param {number} id
 * @returns {Promise<*>} {@link inMemoryToken}
 */
const retrieveTokenDev = async (id, user) => {
    if (inMemoryToken) {
        return inMemoryToken;
    }
    const uName = user || sessionStorage.getItem("uname");
    const options = {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": SERVICE_HOST
        },
        // This will pass the HTTP Only cookie we need to pass REST API.
        withCredentials: true
    };
    retrievedFlag = false;
    await axios
        .get(`${TOKEN_URL_DEV}/${uName}/token`, options)
        .then((response) => {
            if (response.status === 401) {
                clearInterval(id);
            } else {
                retrievedFlag = true;
                const parsed = parseJwt(response.data);
                const myObj = {
                    jwt: response.data,
                    username: parsed.username,
                    guid: parsed.guid,
                    expiryEpochMilli: parsed.exp,
                    expiryDate: getDateFromEpoch(parsed.exp),
                    tokenType: "REFRESH"
                };
                storeToken(myObj);
            }
        })
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.log(error);
        });

    return inMemoryToken;
};

/**
 * This uses Axios library to call the token service.
 * @name retrieveToken
 * @param {number} id
 * @returns {Promise<*>} {@link inMemoryToken}
 */
const retrieveToken = async (id) => {
    const options = {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": SERVICE_HOST
        },
        // This will pass the HTTP Only cookie we need to pass REST API.
        withCredentials: true
    };
    retrievedFlag = false;
    await axios
        .get(TOKEN_URL, options)
        .then((response) => {
            if (response.status === 401) {
                clearInterval(id);
            } else {
                retrievedFlag = true;
                storeToken(response.data.payload);
            }
        })
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.log(error);
        });

    return inMemoryToken;
};

/**
 * This Component does not return anything and instead just sets an interval
 * to call retrieveToken.
 * @name TokenRefresh
 * @constructor retrieveToken {@link retrieveToken}
 */
const TokenRefresh = () => {
    const [dispatchState, setDispatchState] = useState(null);

    const { dispatch, state } = useContext(GlobalContext);
    const { username } = state || {};

    /**
     * Either set or reset the inMemoryToken
     */
    useEffect(() => {
        // Dev
        if (username && sessionStorage.getItem("devLogin") === "devLogin") {
            const id = setInterval(() => {
                if (inMemoryToken) {
                    const { expiry } = inMemoryToken;
                    // call token service if token is expired
                    if (+parseInt(expiry, 10) - +parseInt(EXPIRY_BUFFER_MILLI, 10) < Date.now()) {
                        inMemoryToken = null;
                        if (retrievedFlag) {
                            retrieveTokenDev(id, username).then((response) => {
                                inMemoryToken = response;
                            });
                        }
                    }
                } else if (retrievedFlag) {
                    retrieveTokenDev(id, username).then((response) => {
                        inMemoryToken = response;
                    });
                }
                setDispatchState(inMemoryToken);
            }, TOKEN_EXPIRY_CHECK_MILLI);

            return () => clearInterval(id);
        }
        // otherwise, Production
        const id = setInterval(() => {
            if (inMemoryToken) {
                const { expiry } = inMemoryToken;
                // call token service is token is expired
                if (+parseInt(expiry, 10) - +parseInt(EXPIRY_BUFFER_MILLI, 10) < Date.now()) {
                    inMemoryToken = null;
                    if (retrievedFlag) {
                        retrieveToken(id).then((response) => {
                            inMemoryToken = response;
                        });
                    }
                }
            } else if (retrievedFlag) {
                retrieveToken(id).then((response) => {
                    inMemoryToken = response;
                });
            }
            setDispatchState(inMemoryToken);
        }, TOKEN_EXPIRY_CHECK_MILLI);

        return () => clearInterval(id);
    }, [username]);

    /**
     * Retrieve the token and set it in Global Context
     */
    useEffect(() => {
        const runDispatch = (token) => {
            if (token) {
                dispatch({ type: "Token", token: token.token });
                dispatch({ type: "Username", username: token.username });
                dispatch({ type: "Guid", guid: token.guid });
            }
        };
        if (!dispatchState) {
            runDispatch(inMemoryToken);
        }
    }, [dispatch, dispatchState]);
};

/**
 * This is to just get the inMemoryToken.
 * @name readToken
 * @returns {*} {@link inMemoryToken}
 */
const readToken = () => {
    return inMemoryToken;
};

/**
 * Refresh the token, so that it doesn't expire
 * @name Auth
 * @return {null}
 * @constructor
 */
const Auth = () => {
    TokenRefresh();

    return null;
};

export { Auth, fakeLogout, logout, readToken, retrieveToken, retrieveTokenDev };
