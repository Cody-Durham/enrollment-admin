import React from "react";
import PropTypes from "prop-types";
import Icon from "../icon/Icon";
import ActionButton from "../formInputs/buttons/ActionButton";

import "../../styles/AdminComponent.scss";

const AdminComponent = ({
    availableSlotsMessage,
    handleRouting,
    slotsWarning,
    header,
    icon,
    message1,
    message2,
    name
}) => {
    return (
        <div className="overall-container">
            <div className="left-side">
                <div className="logo-container">
                    <Icon fill="#46A8B0" height={30} iconName={icon} width={30} />
                </div>
                <div className="header-button-container">
                    <div className="logo-header">{header}</div>
                    <div>
                        <ActionButton
                            className="action-button-admin"
                            label="OPEN"
                            name={name}
                            onClick={handleRouting}
                        />
                    </div>
                </div>
            </div>
            <div className="right-container">
                <ul>
                    <li>{message1}</li>
                </ul>
                {/* show warning on home page for non admin if current location has no available slots */}
                {slotsWarning && (
                    <div className="no-avail-slots-container">
                        <div>
                            <Icon fill="#46A8B0" height={20} iconName="ERROR_WARNING" width={20} />
                        </div>
                        <div className="no-avail-slots-text">{availableSlotsMessage}</div>
                    </div>
                )}
                {message2 && (
                    <ul className="second-message">
                        <li>{message2}</li>
                    </ul>
                )}
            </div>
        </div>
    );
};

AdminComponent.propTypes = {
    availableSlotsMessage: PropTypes.string,
    handleRouting: PropTypes.func,
    slotsWarning: PropTypes.bool,
    header: PropTypes.string,
    icon: PropTypes.string,
    message1: PropTypes.string,
    message2: PropTypes.string,
    name: PropTypes.string
};

AdminComponent.defaultProps = {
    availableSlotsMessage: "",
    header: "",
    slotsWarning: false,
    icon: "",
    message1: "",
    message2: "",
    name: ""
};

export default AdminComponent;
