import React from "react";
import PropTypes from "prop-types";

import "../../styles/CheckboxButton.scss";

/**
 * A radio or checkbox input
 * @name CheckboxButton
 * @param className
 * @param checked
 * @param disabled
 * @param handleOnChange
 * @param id
 * @param label
 * @param name
 * @param type
 * @param value
 * @returns {JSX.Element}
 * @constructor
 */
const CheckboxButton = ({ className, checked, disabled, handleOnChange, id, label, name, type, value }) => {
    return (
        <div className={className}>
            <input
                aria-label={label}
                checked={checked}
                disabled={disabled}
                name={name}
                id={id}
                onChange={handleOnChange}
                type={type}
                value={value}
            />
            <label htmlFor={id}>{label}</label>
        </div>
    );
};

CheckboxButton.propTypes = {
    checked: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    handleOnChange: PropTypes.func,
    id: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.string
};

CheckboxButton.defaultProps = {
    checked: false,
    className: "check",
    disabled: false,
    handleOnChange: null,
    id: "",
    label: "",
    name: "",
    type: "checkbox",
    value: ""
};

export default CheckboxButton;
