import React, { useCallback, useContext, useEffect, useReducer, useState } from "react";
import ActionButton from "../formInputs/buttons/ActionButton";
import { GlobalContext } from "../contextProvider/ContextProvider";
import FormReducer from "../../utils/FormReducer";
import JwtDao from "../../dao/JwtDao";
import UserDao from "../../dao/UserDao";
import { fakeLogout } from "../../utils/auth/Auth";

/**
 * @name Spoofer
 * @return {JSX.Element}
 * @constructor
 */
const Spoofer = () => {
    const { dispatch, state } = useContext(GlobalContext);
    const { token, username } = state || {};

    const [hasSubmitted, setHasSubmitted] = useState(false);

    /**
     * @name initialFormState
     * @type {{username: string}}
     */
    const initialFormState = {
        username: username || ""
    };
    const [formState, formDispatch] = useReducer(FormReducer, initialFormState);

    const originalToken = JSON.parse(sessionStorage.getItem("originalToken"));

    /**
     * Grab user details from the service and store them in session
     * @name callUserDetails
     * @callback
     * @type {(function(): Promise<void>)|*}
     */
    const callUserDetails = useCallback(async () => {
        const options = {
            action: "userDetailsRead",
            username,
            token
        };
        UserDao(options)
            .then((response) => {
                if (response) {
                    sessionStorage.removeItem("user_details");
                    sessionStorage.setItem("user_details", JSON.stringify(response.data.payload));
                    dispatch({
                        type: "UserDetails",
                        userDetails: response.data.payload
                    });
                }
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.log(error);
                // if there is a problem, remove the existing session storage item
                sessionStorage.removeItem("user_details");
            });
    }, [dispatch, token, username]);

    /**
     * @name handleChange
     * @param e
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        formDispatch({
            type: "text",
            field: name,
            payload: value
        });
    };

    /**
     * Call the fakeLogout service and set the spoof contexts as well as the username and token contexts
     * This will force the inMemoryToken to take up the new values
     * @param {{}} e
     */
    const handleSubmit = (e) => {
        const spooferForm = e.target.form;
        const checkStatus = spooferForm.checkValidity();
        spooferForm.reportValidity();
        if (checkStatus) {
            setHasSubmitted(true);
            fakeLogout().then(() => {
                dispatch({
                    type: "Username",
                    username: formState.username
                });
            });
            const options = {
                action: "publicTokenRead",
                params: {
                    loggedinUserToken: originalToken || token
                },
                username: formState.username,
                token
            };
            JwtDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    const { jwt } = payload;
                    if (jwt) {
                        dispatch({
                            type: "Token",
                            token: jwt
                        });
                        window.location.reload(false);
                    }
                }
            });
        }
    };

    /**
     * If there is not an originalToken then set it
     * When we have the updated values rewrite the session variable user_details
     */
    useEffect(() => {
        if (token && username) {
            if (!originalToken) {
                sessionStorage.setItem("originalToken", JSON.stringify(token));
            }
            if (hasSubmitted) {
                callUserDetails().then();
                setHasSubmitted(false);
            }
        }
    }, [callUserDetails, hasSubmitted, originalToken, token, username]);

    return (
        <form id="spoofer-form">
            <input
                className="input col-4"
                type="text"
                name="username"
                id="username"
                onChange={handleChange}
                placeholder="Enter a username"
                required
                value={formState.username}
            />
            <ActionButton label="Spoof User" onClick={handleSubmit} />
        </form>
    );
};

export default Spoofer;
