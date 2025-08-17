import React from "react";
import PropTypes from "prop-types";

import "../../styles/GoldenRodBox.scss";

/**
 * A yellow background with text inside
 * @param {bool} bold
 * @param {string} label
 * @param {string} message
 * @returns {JSX.Element}
 */
const GoldenRodBox = ({ bold, includeHr, label, message }) => {
    return (
        <div className="golden-container">
            <div className="golden-container-label">{label}</div>
            {includeHr && <hr />}
            {bold ? (
                <div className="golden-container-message-bold">{message}</div>
            ) : (
                <div className="golden-container-message">{message}</div>
            )}
        </div>
    );
};

GoldenRodBox.propTypes = {
    bold: PropTypes.bool,
    includeHr: PropTypes.bool,
    label: PropTypes.string,
    message: PropTypes.oneOfType([PropTypes.node, PropTypes.string])
};

GoldenRodBox.defaultProps = {
    bold: false,
    includeHr: false,
    label: "",
    message: ""
};

export default GoldenRodBox;
