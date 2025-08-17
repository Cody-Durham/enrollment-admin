import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import LoadingSvg from "../loadingSvg/LoadingSvg";
import UserDetails from "../../utils/UserDetails";

/**
 * Grab the username from the GlobalContext and query the user details API for
 * user roles.
 * If the user has the roles passed in by the calling component, its children
 * are displayed.
 * @name RbA
 * @param {[]} allowedRoles
 * @param {{node}} children
 * @param {string} redirect
 * @return {node} children | LoadingSvg | redirect
 */
const RbA = ({ allowedRoles, children, redirect }) => {
    const [hasRole, setHasRole] = useState(false);
    // Set boolean for loader
    const [loader, setLoader] = useState(true);

    const userDetails = UserDetails();

    /**
     * Retrieve an array of the current user's roles from the user_details
     * sessionStorage. If we successfully retrieve that data, we create the
     * localStorage item, and re-render
     * @name getRoles
     * @returns {[]|{validator, value: []}|{validator: *, value: []}|[string]|{}}
     */
    const getRoles = useCallback(() => {
        if (userDetails) {
            setLoader(false);
            return userDetails.roleDtos;
        }

        return [];
    }, [userDetails]);

    /**
     * Does the user have the correct role to view this page?
     * @name hasRoles
     * @returns {boolean} hasRole
     */
    const hasRoles = useCallback(() => {
        const roleList = getRoles();
        // convert the roleList into an array of roles
        const roles = roleList.reduce((result, roleDto) => {
            result.push(roleDto.role);

            return result;
        }, []);

        if (allowedRoles.length > 0) {
            const roleMatch = allowedRoles.filter((allowedRole) => roles.includes(allowedRole));
            if (roleMatch.length) {
                setHasRole(true);
            }
        }
    }, [allowedRoles, getRoles]);

    useEffect(() => {
        if (userDetails) {
            hasRoles();
        }
    }, [hasRoles, userDetails]);

    if (hasRole) {
        return children;
    }
    // forbid access
    return loader ? <LoadingSvg /> : <Navigate to={redirect} />;
};

RbA.propTypes = {
    allowedRoles: PropTypes.instanceOf(Array).isRequired,
    children: PropTypes.node,
    redirect: PropTypes.string
};

RbA.defaultProps = {
    children: null,
    redirect: ""
};

export default RbA;
