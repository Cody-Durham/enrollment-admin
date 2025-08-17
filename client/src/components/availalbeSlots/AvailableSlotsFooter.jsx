import React from "react";
import PropTypes from "prop-types";
import "../../styles/AvailableSlotsFooter.scss";

const AvailableSlotsFooter = ({ totalsObj }) => {
    const negativeNumber = totalsObj.availableCounter < 0 ? "negative-number-class" : "";

    return (
        <div className="footer-avail-slots-container">
            <div className="footer-item-container" id="text">
                Total
            </div>
            <div className="footer-item-container">{totalsObj.currentCounter}</div>
            <div className="footer-item-container">{totalsObj.projectedCounter}</div>
            <div className={`footer-item-container ${negativeNumber}`}>{totalsObj.availableCounter}</div>
            <div className="footer-item-container">{totalsObj.enrolledCounter}</div>
        </div>
    );
};

AvailableSlotsFooter.propTypes = {
    totalsObj: PropTypes.oneOfType([PropTypes.object]).isRequired
};

export default AvailableSlotsFooter;
