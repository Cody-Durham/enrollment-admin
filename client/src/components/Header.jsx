import React, { useContext, useEffect, useState } from "react";
import Icon from "./icon/Icon";
import UserDetails from "../utils/UserDetails";

import { EMPLOYEE_DASHBOARD, EVALUATION_SITE } from "../utils/auth/config";
import { GlobalContext } from "./contextProvider/ContextProvider";
import { logout } from "../utils/auth/Auth";
import { SetAllLocationDtos } from "../components/contextProvider/ContextSetter";

import "../styles/Header.scss";

const Header = () => {
    const { state } = useContext(GlobalContext);
    const { userDetails } = state;
    const [usersLocation, setUsersLocation] = useState();

    /**
     * Set the locationDtos in context
     */
    SetAllLocationDtos();

    /**
     * Pull out the users location
     */
    useEffect(() => {
        if (UserDetails && !usersLocation) {
            const { userAttributeDto } = userDetails;

            if (userAttributeDto) {
                const { userAttributeMap } = userAttributeDto;
                if (userAttributeMap) {
                    if (userAttributeMap.CURRENT_PREDOMINANT_SCHOOL) {
                        setUsersLocation(userAttributeMap.CURRENT_PREDOMINANT_SCHOOL?.name);
                    }
                }
            }
        }
    }, [userDetails, usersLocation]);

    return (
        <>
            <div className="header">
                <div className="icon-container">
                    <a href={EMPLOYEE_DASHBOARD}>
                        {" "}
                        <Icon fill="#0669B3" height={42} iconName="DCSD" width={43} />
                    </a>
                </div>
                <div className="header-left-container">
                    <div className="header-left">
                        <h5>Douglas County Schools</h5>
                        <h6>Employee Dashboard</h6>
                    </div>
                    <div className="header-right">
                        <div className="dropdown">
                            <div className="emp-icon" type="button" data-bs-toggle="dropdown">
                                <Icon fill="#A7A9AC" height={25} iconName="PERSON_ICON" width={25} />
                            </div>
                            <ul className="dropdown-menu ">
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="https://iaas5idm.fischeridentity.com/identity/self-service/dcs/kiosk.jsf"
                                        rel="noopener noreferrer"
                                        tabIndex="0"
                                        target="_blank"
                                    >
                                        Password Reset
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#" onClick={logout} onKeyDown={logout}>
                                        Logout
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="emp-info-container">
                            <div className="emp-first-last">{userDetails?.displayName}</div>
                            <div className="emp-position">
                                {userDetails?.category ? userDetails.category : "Position Unavailable"}
                            </div>
                            {usersLocation ? (
                                <a
                                    className="emp-location"
                                    href={`${EVALUATION_SITE}/profile`}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    {usersLocation}
                                </a>
                            ) : (
                                <a
                                    className="emp-location"
                                    href={`${EVALUATION_SITE}/profile`}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    No Location Available
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <hr />
        </>
    );
};

export default Header;
