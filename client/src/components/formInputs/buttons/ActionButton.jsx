import React from "react";
import PropTypes from "prop-types";
import Icon from "../../icon/Icon";

import "../../../styles/ActionButton.scss";

/**
 * A button for performing various actions (submit, open, close, cancel, etc)
 * @name ActionButton
 * @param {string} className
 * @param {bool} disable
 * @param {string} id
 * @param {string} label
 * @param {func} onClick
 * @return {JSX.Element}
 * @constructor
 */
const ActionButton = ({
    children,
    className,
    disable,
    id,
    label,
    name,
    onClick,
    onMouseEnter,
    onMouseLeave,
    status
}) => {
    const buttonType = () => {
        if (status) {
            return (
                <div className="button-with-status-container">
                    <button
                        aria-label={label}
                        className={className}
                        disabled={disable}
                        id={id}
                        name={name}
                        onClick={onClick}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        tabIndex={0}
                        type="button"
                    >
                        {label}
                    </button>
                    <div className="status-on-button">
                        <Icon height={20} iconName={status.toUpperCase()} width={20} />
                    </div>
                </div>
            );
        }
    };

    return !status ? (
        <button
            aria-label={label}
            className={className}
            disabled={disable}
            id={id}
            name={name}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            tabIndex={0}
            type="button"
        >
            {label}
            {children}
        </button>
    ) : (
        buttonType()
    );
};

ActionButton.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    disable: PropTypes.bool,
    id: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    status: PropTypes.string
};

ActionButton.defaultProps = {
    children: null,
    className: "action-button-reg",
    disable: false,
    id: null,
    label: null,
    name: null,
    onClick: null,
    onMouseEnter: null,
    onMouseLeave: null,
    status: null
};

export default ActionButton;
