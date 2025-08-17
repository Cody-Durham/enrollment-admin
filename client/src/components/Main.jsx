import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RbA from "./rba/RbA.jsx";

/**
 * Guardian Open Enrollment main
 * @name Main
 * @return {JSX.Element}
 * @constructor
 */
const Main = () => {
    const navigate = useNavigate();
    const allowedRolesArray = ["ADMIN", "REGISTRAR", "PRINCIPLE"];

    useEffect(() => {
        const path = sessionStorage.getItem("orig-path");
        navigate(path);
    }, [navigate]);

    return (
        <RbA allowedRoles={allowedRolesArray} redirect="/notFound">
            <div>{/* <Header /> */}</div>
        </RbA>
    );
};

export default Main;
