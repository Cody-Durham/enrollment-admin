import React, { useReducer } from "react";
import { useNavigate } from "react-router-dom";
import FormReducer from "../utils/FormReducer";
import ActionButton from "./formInputs/buttons/ActionButton";

const Login = () => {
    const navigate = useNavigate();

    const initialFormState = {
        username: ""
    };

    const [formState, formDispatch] = useReducer(FormReducer, initialFormState);

    const handleOnChange = (e) => {
        const { name, value } = e.target;

        formDispatch({
            type: "text",
            field: name,
            payload: value
        });
    };

    const handleSubmit = () => {
        const { username } = formState;
        if (username.trim().length) {
            sessionStorage.clear();
            sessionStorage.setItem("devLogin", "devLogin");
            navigate(`/loadtest/${username.trim()}`);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                width: "80%",
                margin: "0 auto",
                background: "#D3D3D3"
            }}
        >
            <div
                style={{
                    width: "100%",
                    margin: "0 auto",
                    marginBottom: "50px",
                    marginTop: "50px",
                    textAlign: "center"
                }}
            >
                <h2>
                    Welcome to Open Enrollment <u>Admin Backdoor!</u>
                </h2>
                <p>Please Log In Below</p>
                <div style={{ marginTop: "50px", width: "100%" }}>
                    <label htmlFor="username">
                        Username:
                        <input
                            className="form-control"
                            id="username"
                            name="username"
                            onChange={handleOnChange}
                            type="text"
                        />
                    </label>
                </div>
                <div className="m-5" />
                <ActionButton label="Log In" onClick={handleSubmit} />
            </div>
        </div>
    );
};

export default Login;
