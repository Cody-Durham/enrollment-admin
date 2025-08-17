import { useCallback, useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../components/contextProvider/ContextProvider";
import UserDao from "../dao/UserDao";

/**
 * Query the user service for a user's details and write it to sessionStorage
 * @name UserDetails
 * @return {[]}
 */
const UserDetails = () => {
    // gets state from context provider
    const { dispatch, state } = useContext(GlobalContext);
    const { token, userDetails, username } = state || null;

    const retrieveUser = useRef(true);

    /**
     * Write UserDetails to session storage.
     * @name writeUserDetails
     * @param {string} name
     * @param {{}} payload
     */
    const writeUserDetails = (name, payload) => {
        sessionStorage.setItem(name, JSON.stringify(payload));
    };

    /**
     * Query the UserDetail service and set a 'user_detail' sessionStorage item.
     * @name callUserDetails
     * @callback
     * @return {Promise<unknown>}
     */
    const callUserDetails = useCallback(async () => {
        retrieveUser.current = false;
        const options = {
            action: "userDetailsRead",
            username,
            token
        };
        UserDao(options)
            .then((response) => {
                if (response) {
                    const { payload } = response.data;
                    dispatch({ type: "UserDetails", userDetails: payload });
                    writeUserDetails("user_details", payload);
                }
            })
            .catch((error) => {
                // @TODO: log the error to a service?
                // eslint-disable-next-line no-console
                console.log(error);
                // if there is a problem, remove the existing session storage item
                sessionStorage.removeItem("user_details");
            });
    }, [dispatch, token, username]);

    /**
     * Retrieve user details from the user_details session storage
     * @name getUserDetails
     * @callback
     */
    const getUserDetails = useCallback(
        (userInterval) => {
            if (userDetails) {
                clearInterval(userInterval);
                retrieveUser.current = true;
            } else if (token && username) {
                if (retrieveUser.current) {
                    callUserDetails().then();
                }
            }
        },
        [userDetails, token, username, callUserDetails]
    );

    /**
     * If unable to read user_details sessionStorage, set an interval to keep checking
     */
    useEffect(() => {
        if (!userDetails) {
            const user = JSON.parse(sessionStorage.getItem("user_details"));
            if (user) {
                dispatch({ type: "UserDetails", userDetails: user });
            } else {
                const userInterval = setInterval(() => {
                    getUserDetails(userInterval);
                }, 1000);
            }
        }
    }, [dispatch, getUserDetails, userDetails]);

    return userDetails || null;
};

export default UserDetails;
