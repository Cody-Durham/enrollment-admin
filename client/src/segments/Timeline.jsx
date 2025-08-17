import React, { useCallback, useContext, useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import { ToastContainer } from "react-toastify";
import Toolbar from "../components/Toolbar.jsx";
import RbA from "../components/rba/RbA.jsx";
import { GlobalContext } from "../components/contextProvider/ContextProvider.jsx";
import OpenEnrollmentDao from "../dao/OpenEnrollmentDao.jsx";
import ActionButton from "../components/formInputs/buttons/ActionButton.jsx";
import { formatDate, getEpoch, getTodayWithYear } from "../utils/DateFormatter.jsx";
import WindowLength from "../components/formComponents/windowLength/WindowLength.jsx";
import { monthObj, monthsArr } from "../const/Translations.jsx";
import WindowAndPermissionDialog from "../components/modals/WindowAndPermissionDialog.jsx";
import LoadingSvg from "../components/loadingSvg/LoadingSvg.jsx";
import { millisecondsToSeconds, secondsToDays } from "../const/Translations.jsx";

import "../styles/Timeline.scss";

const Timeline = () => {
    const { dispatch, state } = useContext(GlobalContext);
    const { oeActiveDistrictWindow, token } = state;
    const allowedRolesArray = ["OPEN_ENROLLMENT_ADMIN", "REGISTRAR", "PRINCIPAL"];

    const [allDistrictWindowDiffs, setAllDistrictWindowDiffs] = useState(null); // differentiators for the round
    const [allWindows, setAllWindows] = useState(null); // List of 2 object DTOs. Round1 & Round2
    const [actionWindows, setActionWindows] = useState(null);
    const [displayRound, setDisplayRound] = useState(oeActiveDistrictWindow?.enrollmentRound);
    const [loader, setLoader] = useState(false);
    const [monthHeaders, setMonthHeaders] = useState(0);
    const [oeActionControls, setOeActionControls] = useState(null);
    const [open, setOpen] = useState("false");
    const [round1Windows, setRound1Windows] = useState(null);
    const [round2Windows, setRound2Windows] = useState(null);
    const [round1Start, setRound1Start] = useState(null);
    const [round2End, setRound2End] = useState(null);
    const [selectedTab, setSelectedTab] = useState(oeActiveDistrictWindow?.enrollmentRound);
    const [totalDays, setTotalDays] = useState(0);

    /**
     * @name handleClick
     * @param {*} e
     * This handleClick is responsible for selecting the tabs (buttons)
     * for what window to render
     */
    const handleClick = (e) => {
        const { name } = e.target;
        if (name === "all-windows") {
            setDisplayRound("all-windows");
            setSelectedTab("all-windows");
        }
        if (name === "round1Button") {
            setDisplayRound("ROUND1");
            setSelectedTab("ROUND1");
        }
        if (name === "round2Button") {
            setDisplayRound("ROUND2");
            setSelectedTab("ROUND2");
        }
    };

    const monthDiff = (start, end) => {
        const startObj = new Date(start);
        const endObj = new Date(end);

        let months;
        months = (endObj.getFullYear() - startObj.getFullYear()) * 12;

        months -= startObj.getMonth();
        months += endObj.getMonth();

        return months <= 0 ? 0 : months;
    };

    /**
     * This is setting the headers in the table
     */
    const getMonthHeaders = useCallback(() => {
        const myDate = new Date(round1Start);

        const startMonth = myDate.getMonth();

        const monthList = [];
        let count = startMonth;

        const totalMonths = monthDiff(round1Start, round2End);

        for (let i = startMonth; i <= startMonth + totalMonths; i++) {
            if (count > 11) {
                count = 0;
            }
            monthList.push(monthObj[count]);
            count += 1;
        }

        return monthList;
    }, [round1Start, round2End]);

    /**
     * Reduce through the selected "round" (action) set the actionWindows
     * Also, adds a few parameters to use over in WindowLength
     */
    useEffect(() => {
        if (round1Windows && displayRound && round2Windows && round1Start && round2End && totalDays) {
            let action = [];
            // set the display round to show correct graph per "tab"
            if (displayRound === "all-windows") {
                const combinedWindows = [...round1Windows, ...round2Windows];
                action = combinedWindows;
            }
            if (displayRound === "ROUND1") {
                action = round1Windows;
            }
            if (displayRound === "ROUND2") {
                action = round2Windows;
            }

            const start = new Date(round1Start);
            const sMonth = start.getMonth() + 1;
            const sYear = start.getFullYear();
            const startEpoch = getEpoch(`${sYear}-${sMonth.toString().padStart(2, "0")}-01`) / 1000;

            const end = new Date(round2End);
            const eMonth = end.getMonth() + 1;
            const eYear = end.getFullYear();
            const endEpoch =
                getEpoch(`${eYear}-${eMonth.toString().padStart(2, "0")}-${monthsArr[end.getMonth()].days}`) / 1000;

            const tempWindows = action.reduce((results, dto) => {
                const actionStartEpoch = millisecondsToSeconds(getEpoch(dto.startDate));
                const actionEndEpoch = millisecondsToSeconds(getEpoch(dto.endDate));
                const pre = secondsToDays(actionStartEpoch - startEpoch);
                const duration = secondsToDays(actionEndEpoch - actionStartEpoch);
                const post = secondsToDays(endEpoch - actionEndEpoch);
                const prePercent = (pre / totalDays) * 100;
                const durPercent = (duration / totalDays) * 100;
                const postPercent = (post / totalDays) * 100;
                const tempObj = {
                    action: dto.action,
                    end: dto.endDate,
                    pre: prePercent,
                    duration: durPercent,
                    post: postPercent,
                    round: dto.enrollmentRound,
                    start: dto.startDate
                };
                results.push(tempObj);

                return results;
            }, []);

            if (tempWindows && tempWindows.length > 0) {
                setActionWindows(tempWindows);
            }
        }
    }, [displayRound, round1Start, round1Windows, round2End, round2Windows, totalDays]);

    /**
     * Set the month headers in the table
     * Convert start and end dates/ times to epoch
     */
    useEffect(() => {
        if (round1Start && round2End && !totalDays) {
            setMonthHeaders(getMonthHeaders(round1Start));
            const start = new Date(round1Start);
            const sMonth = start.getMonth() + 1;
            const sYear = start.getFullYear();
            const secStart = getEpoch(`${sYear}-${sMonth.toString().padStart(2, "0")}-01`);

            const end = new Date(round2End);
            const eMonth = end.getMonth() + 1;
            const eYear = end.getFullYear();
            const secEnd = getEpoch(`${eYear}-${eMonth.toString().padStart(2, "0")}-${monthsArr[end.getMonth()].days}`);

            const totalSeconds = millisecondsToSeconds(secEnd - secStart);
            const tempTotalDays = secondsToDays(totalSeconds);

            setTotalDays(tempTotalDays);
            monthsArr.forEach((obj) => {
                obj.percent = (obj.days / tempTotalDays) * 100;
            });
        }
    }, [round1Start, round2End, getMonthHeaders, totalDays]);

    /**
     * Get the start date for Round1
     * Get the end date for Round2
     * Send those dates to method figureStartDate to set
     */
    useEffect(() => {
        if (allWindows) {
            const getRound1Window = allWindows.find((obj) => obj.enrollmentRound === "ROUND1");
            const getRound2Window = allWindows.find((obj) => obj.enrollmentRound === "ROUND2");

            const dateStart = formatDate(getRound1Window?.startDate);
            const dateEnd = formatDate(getRound2Window?.endDate);

            setRound1Start(dateStart);
            setRound2End(dateEnd);
        }
    }, [allWindows]);

    /**
     * Get the schoolYearKey and dispatch to state (contextProvider)
     * this call is from OE current district window Round1 || Round2
     */
    useEffect(() => {
        if (token) {
            setLoader(true);
            const options = {
                action: "oeActiveDistrictWindowRead",
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
                        setDisplayRound(payload.enrollmentRound);
                        setSelectedTab(payload.enrollmentRound);

                        dispatch({
                            type: "OeActiveDistrictWindow",
                            oeActiveDistrictWindow: payload
                        });
                    } else {
                        setOpen("windows-closed");
                    }
                }
                setLoader(false);
            });
        }
    }, [dispatch, token]);

    /**
     * Get all district windows
     * ROUND1 & ROUND2
     */
    useEffect(() => {
        if (oeActiveDistrictWindow && token && !allDistrictWindowDiffs) {
            // ROUND1 or ROUND2
            const options = {
                action: "oeAllDistrictWindowsByYear",
                schoolYearKey: oeActiveDistrictWindow?.schoolYearKey,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
                        setAllWindows(payload);
                        const rounds = payload.reduce((results, value) => {
                            results.push(parseInt(value.key, 10));

                            return results;
                        }, []);
                        rounds.sort((a, b) => {
                            return parseInt(a, 10) > parseInt(b, 10) ? 1 : -1;
                        });
                        // differentiators for the round
                        setAllDistrictWindowDiffs(rounds);
                    }
                }
            });
        }
    }, [allDistrictWindowDiffs, oeActiveDistrictWindow, token]);

    /**
     * Get the action control by schoolYearKey.
     * This is only for the text in above the table to show the end date
     */
    useEffect(() => {
        if (
            allDistrictWindowDiffs &&
            allDistrictWindowDiffs.length > 0 &&
            oeActiveDistrictWindow &&
            token &&
            !oeActionControls
        ) {
            const options = {
                action: "oeActionControlsByYear",
                schoolYearKey: oeActiveDistrictWindow.schoolYearKey,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
                        payload.sort((a, b) => {
                            return parseInt(a.key, 10) > parseInt(b.key, 10) ? 1 : -1;
                        });

                        setOeActionControls(payload);
                        const round1 = payload.filter(
                            (obj) => parseInt(obj.differentiator, 10) === allDistrictWindowDiffs[0]
                        );
                        const tempRound1 = round1.reduce((results, dto) => {
                            const temp = dto;
                            temp.enrollmentRound = "ROUND1";
                            results.push(temp);

                            return results;
                        }, []);
                        setRound1Windows(tempRound1);

                        const round2 = payload.filter(
                            (obj) => parseInt(obj.differentiator, 10) === allDistrictWindowDiffs[1]
                        );
                        const tempRound2 = round2.reduce((results, dto) => {
                            const temp = dto;
                            temp.enrollmentRound = "ROUND2";
                            results.push(temp);

                            return results;
                        }, []);
                        setRound2Windows(tempRound2);
                    }
                }
            });
        }
    }, [allDistrictWindowDiffs, oeActiveDistrictWindow, oeActionControls, token]);

    return (
        <RbA allowedRoles={allowedRolesArray} redirect="/notFound">
            <Header />
            <ToastContainer style={{ width: "50%" }} />
            <div className="gutter-95" style={{ marginBottom: "100px" }}>
                <Toolbar label="View Action Control Windows" showBackButton />
                <div className="round-tabs-container">
                    <ActionButton
                        className={selectedTab === "all-windows" ? "action-button-200" : "action-button-inactive-200"}
                        label="All Windows"
                        name="all-windows"
                        onClick={handleClick}
                    />
                    <ActionButton
                        className={selectedTab === "ROUND1" ? "action-button-200" : "action-button-inactive-200"}
                        label="Round 1"
                        name="round1Button"
                        onClick={handleClick}
                    />
                    <ActionButton
                        className={selectedTab === "ROUND2" ? "action-button-200" : "action-button-inactive-200"}
                        label="Round 2"
                        name="round2Button"
                        onClick={handleClick}
                    />
                </div>
                <div className="school-year mt-5">
                    <div className="yellow">
                        <span>Today&apos;s Date:&nbsp;</span>
                        {formatDate(getTodayWithYear())}
                    </div>
                </div>
                <div className="header-container">
                    <div className="month special">Window</div>
                    {monthHeaders &&
                        monthHeaders.map((month, index) => {
                            const monthsArrIndex = index % 12;
                            const uniqueKey = `header-th-${index}`;
                            return (
                                <div
                                    className="month"
                                    key={uniqueKey}
                                    style={{ width: `"${monthsArr[monthsArrIndex].percent}%"` }}
                                >
                                    {month}
                                </div>
                            );
                        })}
                </div>
                {actionWindows &&
                    actionWindows.map((obj, index) => {
                        const uniqueKey = `all-windows-${obj.key}-${index}`;
                        const stripe = index % 2 !== 0 ? "" : "stripe";
                        return (
                            <div className={stripe} key={uniqueKey}>
                                <WindowLength actionObj={obj} />
                            </div>
                        );
                    })}
                <div style={{ marginTop: "20px" }}>
                    <hr />
                </div>
            </div>
            <WindowAndPermissionDialog
                id="windows-closed"
                open={open}
                sorryTitle="Open Enrollment Manager is now closed"
                sorryMessage="Sorry, the Open Enrollment Manager is currently unavailable. Please return during Round 1 or Round 2 windows."
            />
            {loader && <LoadingSvg />}
        </RbA>
    );
};

export default Timeline;
