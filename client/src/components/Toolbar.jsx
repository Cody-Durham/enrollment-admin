import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Icon from "./icon/Icon";
import ActionButton from "./formInputs/buttons/ActionButton";

import "../styles/Toolbar.scss";

const Toolbar = ({ label, showBackButton }) => {
    return (
        <div className="toolbar-container">
            <div className="title-container">
                <div className="logo-container">
                    <Icon fill="#46A8B0" height={50} iconName="OPEN_ENROLLMENT_LOGO" width={50} />
                </div>
                <div className="text-container">
                    <div className="logo-text">{label}</div>
                </div>
            </div>
            <div>
                {showBackButton && (
                    <Link to="/home">
                        <ActionButton className="action-button-200" label="Manager Home Page" />
                    </Link>
                )}
            </div>
        </div>
    );
};

Toolbar.propTypes = {
    label: PropTypes.string,
    showBackButton: PropTypes.bool
};

Toolbar.defaultProps = {
    label: "",
    showBackButton: false
};

export default Toolbar;
