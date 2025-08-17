import React from "react";
import { PropTypes } from "prop-types";
import { enumToString, miniRoundTranslate } from "../../../const/Translations";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {
    getEpoch,
    getDateRangeFromEpoch,
    formatDateAndTimeWithMin,
    formatDateNumbersOnly
} from "../../../utils/DateFormatter";

const WindowLength = ({ actionObj }) => {
    const { start, end } = actionObj;
    const startEpoch = getEpoch(start);
    const endEpoch = getEpoch(end);

    // Showing dates as numbers only
    const dateStart = formatDateNumbersOnly(actionObj.start);
    const dateEnd = formatDateNumbersOnly(actionObj.end);

    const getTooltip = () => {
        const { end, start } = actionObj;
        return (
            <div className="tool-tip-container">
                <h6>
                    <b>
                        <u>{enumToString(actionObj.action)}</u>
                    </b>
                </h6>
                <span>Start: {formatDateAndTimeWithMin(start)}</span>
                <span>End: {formatDateAndTimeWithMin(end)}</span>
                <span>Duration: {getDateRangeFromEpoch(startEpoch, endEpoch)}</span>
            </div>
        );
    };

    return (
        <div className="action-container">
            <div className="action-window-container">
                <div>{enumToString(actionObj.action)}</div>
                <div>{miniRoundTranslate(actionObj.round)}</div>
            </div>
            <div className="action-data-container">
                <div className="window-pre text-truncate" style={{ width: `${actionObj.pre}%` }}>
                    {actionObj.round === "ROUND2" && (
                        <span className="round2-date-placement">
                            <span>{dateStart} - </span>
                            <span>{dateEnd}</span>
                        </span>
                    )}
                    &nbsp;
                </div>
                {actionObj.round === "ROUND1" && (
                    <OverlayTrigger
                        delay={{ hide: 5, show: 300 }}
                        overlay={(props) => (
                            <Tooltip className="tooltip-window" {...props}>
                                {getTooltip()}
                            </Tooltip>
                        )}
                        placement="top"
                    >
                        <div className="round1-class" style={{ width: `${actionObj.duration}%` }}>
                            &nbsp;
                        </div>
                    </OverlayTrigger>
                )}
                {actionObj.round === "ROUND2" && (
                    <OverlayTrigger
                        delay={{ hide: 5, show: 300 }}
                        overlay={(props) => (
                            <Tooltip className="tooltip-window" {...props}>
                                {getTooltip()}
                            </Tooltip>
                        )}
                        placement="top"
                    >
                        <div className="round2-class" style={{ width: `${actionObj.duration}%` }}>
                            &nbsp;
                        </div>
                    </OverlayTrigger>
                )}

                <div className="text-truncate" style={{ width: `${actionObj.post}%` }}>
                    {actionObj.round === "ROUND1" && (
                        <span className="date-placement">
                            <span>{dateStart} - </span>
                            <span>{dateEnd}</span>
                        </span>
                    )}
                    &nbsp;
                </div>
            </div>
        </div>
    );
};

WindowLength.propTypes = {
    actionObj: PropTypes.oneOfType([PropTypes.object]).isRequired
};

export default WindowLength;
