import React from "react";
import PropTypes from "prop-types";

import "../../styles/AvailableSlotsRow.scss";

const AvailableSlotsRow = ({ dto, handleNumberChange, lockPage }) => {
    const negativeNumber = dto.availableCount < 0 ? "negative-number-class" : "";
    const disabledColor = lockPage ? "disabled-input" : "";

    return (
        <div className="avail-slots-container">
            <div className="item-container grade-font">{dto?.grade}</div>
            <div className="item-container">
                <input
                    disabled={lockPage}
                    className={disabledColor}
                    name={`currentEnrollmentCount-${dto?.grade}`}
                    onChange={handleNumberChange}
                    type="text"
                    value={dto?.currentEnrollmentCount}
                />
            </div>
            <div className="item-container">
                <input
                    disabled={lockPage}
                    className={disabledColor}
                    name={`targetEnrollmentCount-${dto?.grade}`}
                    onChange={handleNumberChange}
                    type="text"
                    value={dto?.targetEnrollmentCount}
                />
            </div>

            <div className={`item-container numbers ${negativeNumber}`}>{dto?.availableCount}</div>
            <div className="item-container numbers">{dto?.openEnrolledCount}</div>
        </div>
    );
};

export default AvailableSlotsRow;

AvailableSlotsRow.propTypes = {
    dto: PropTypes.oneOfType([PropTypes.object]).isRequired,
    handleNumberChange: PropTypes.func.isRequired,
    lockPage: PropTypes.bool
};

AvailableSlotsRow.defaultProps = {
    lockPage: false
};
