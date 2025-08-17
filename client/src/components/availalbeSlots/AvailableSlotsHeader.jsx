import React from "react";

import "../../styles/AvailableSlotsRow.scss";

const AvailableSlotsHeader = () => {
    return (
        <div className="header-avail-slots-container">
            <div className="header-item-container" id="text">
                Grade
            </div>
            <div className="header-item-container" id="text">
                Current Enrollment
            </div>
            <div className="header-item-container" id="text">
                Projected Enrollment
            </div>
            <div className="header-item-container" id="text">
                Available Slots
            </div>
            <div className="header-item-container" id="text">
                Open Enrolled Students
            </div>
        </div>
    );
};

export default AvailableSlotsHeader;
