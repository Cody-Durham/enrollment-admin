import React, { useCallback, useContext, useEffect, useReducer, useState } from "react";
import Header from "../components/Header.jsx";
import { toast, ToastContainer } from "react-toastify";
import Toolbar from "../components/Toolbar.jsx";
import { GlobalContext } from "../components/contextProvider/ContextProvider.jsx";
import RbA from "../components/rba/RbA.jsx";
import FormReducer from "../utils/FormReducer.jsx";
import OpenEnrollmentDao from "../dao/OpenEnrollmentDao.jsx";
import LoadingSvg from "../components/loadingSvg/LoadingSvg.jsx";
import { enumToEnglish } from "../const/Translations.jsx";
import AvailableSlotsRow from "../components/availalbeSlots/AvailableSlotsRow.jsx";
import AvailableSlotsHeader from "../components/availalbeSlots/AvailableSlotsHeader.jsx";
import DcsdDialog from "../components/modals/DcsdDialog.jsx";
import ActionButton from "../components/formInputs/buttons/ActionButton.jsx";
import { Link } from "react-router-dom";
import AvailableSlotsFooter from "../components/availalbeSlots/AvailableSlotsFooter.jsx";
import { formatDateAndTime } from "../utils/DateFormatter.jsx";
import ValidationPatterns from "../utils/ValidationPatterns.jsx";
import { stringGradeOrdinal } from "../const/UtilConsts.jsx";
import WindowAndPermissionDialog from "../components/modals/WindowAndPermissionDialog.jsx";
import { EVALUATION_SITE } from "../utils/auth/config.js";

import "../styles/Numbers.scss";

const Numbers = () => {
    const { dispatch, state } = useContext(GlobalContext);
    const { oeActiveDistrictWindow, token, userDetails } = state;
    const allowedRolesArray = ["OPEN_ENROLLMENT_ADMIN", "REGISTRAR", "PRINCIPAL"];

    const initialFormState = {
        selectedSchoolId: null,
        grades: [
            {
                availableCount: 0,
                createdByGuid: "",
                currentEnrollmentCount: 0,
                grade: "",
                key: "",
                lastUpdatedByGuid: "",
                openEnrolledCount: 0,
                participatingSchoolId: 0,
                targetEnrollmentCount: 0
            }
        ]
    };

    const [availableSlotsDto, setAvailableSlotsDto] = useState([]);
    const [formState, formDispatch] = useReducer(FormReducer, initialFormState);
    const [loader, setLoader] = useState(false);
    const [lockPage, setLockPage] = useState(true);
    const [oeActionControls, setOeActionControls] = useState(null);
    const [open, setOpen] = useState("false");
    const [participatingSchools, setParticipatingSchools] = useState(null);
    const [renderActionControl, setRenderActionControl] = useState(false);
    const [schoolSlotsDates, setSchoolSlotDates] = useState(null);
    const [totalsObj, setTotalsObj] = useState({
        currentCounter: 0,
        projectedCounter: 0,
        availableCounter: 0,
        enrolledCounter: 0
    });
    const [usersLocation, setUsersLocation] = useState();
    const [toEnglish, setToEnglish] = useState("");
    const [showDash, setShowDash] = useState(false);

    const getBackToDialogActions = () => {
        return (
            <>
                <Link to="/home">
                    <ActionButton
                        className="action-button-cancel"
                        label="Cancel"
                        onClick={() => {
                            setOpen("false");
                        }}
                    />
                </Link>
                <a href={`${EVALUATION_SITE}/profile`}>
                    <ActionButton
                        ariaLabel="Navigate to profile setting page"
                        className="action-button-reg"
                        label="Set Profile"
                    ></ActionButton>
                </a>
            </>
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const selectedSchool = participatingSchools.find((school) => {
            return school.key === value;
        });
        if (selectedSchool.educationalTrack !== "NOT_APPLICABLE") {
            setShowDash(true);
            snakeToTitleCase(selectedSchool.educationalTrack);
        } else {
            setShowDash(false);
        }

        formDispatch({
            type: "text",
            field: name,
            payload: value
        });
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        const nameArr = name.split("-");

        if (!ValidationPatterns.digitOnly.test(value) && value !== "") {
            return false;
        }

        if (nameArr && nameArr.length > 0) {
            const newInput = nameArr[0];
            const newGrade = nameArr[1];

            let tempFormState = formState;

            const { grades } = tempFormState;
            const match = grades.filter((obj) => obj.grade === newGrade);

            if (match && match.length > 0) {
                // Always default to 0 if the input is empty string ("")
                match[0][newInput] = value === "" ? 0 : parseInt(value, 10);

                if (value !== "") {
                    // available slots = projected - current
                    if (newInput === "currentEnrollmentCount") {
                        match[0].availableCount = parseInt(match[0]?.targetEnrollmentCount, 10) - parseInt(value, 10);
                    } else {
                        match[0].availableCount = parseInt(value, 10) - parseInt(match[0]?.currentEnrollmentCount, 10);
                    }
                } else {
                    // set Available Slots to Projected Enrollment if value is empty string ("")
                    match[0].availableCount =
                        parseInt(match[0].targetEnrollmentCount, 10) - parseInt(match[0].currentEnrollmentCount, 10);
                }
                formDispatch({
                    type: "reset",
                    payload: { ...tempFormState }
                });
            }
        }
    };

    const handleSubmit = () => {
        setLoader(true);

        let tempFormState = formState;
        const options = {
            action: "oeSubmitAvailableSlots",
            data: tempFormState.grades,
            schoolId: formState.selectedSchoolId,
            token
        };
        OpenEnrollmentDao(options).then((response) => {
            if (response) {
                const { payload } = response.data;
                if (payload && payload.length > 0) {
                    const sortedPayload = payload.sort((a, b) => {
                        return stringGradeOrdinal[a.grade] > stringGradeOrdinal[b.grade] ? 1 : -1;
                    });
                    toast.success("Enrollment values have been successfully saved", {
                        autoClose: 2000
                    });
                    // update formState with payload from response
                    tempFormState.grades = sortedPayload;

                    formDispatch({
                        type: "reset",
                        payload: { ...tempFormState }
                    });
                }
            }
            setLoader(false);
        });
    };

    /**
     * Loops through userDetails roles to evaluate permissions for page links
     * @name hasRole
     * @param {[]} roles
     * @return {Boolean}
     */
    const hasRole = (roles, window = 0) => {
        if (userDetails) {
            const { roleDtos } = userDetails;
            const rolesArray = roleDtos?.reduce((results, value) => {
                if (roles.includes(value.role)) {
                    results.push(value.role);
                }
                return results;
            }, []);
            if (window !== 0) {
                return rolesArray.length > 0 && ["ROUND1", "ROUND2"].includes(oeActiveDistrictWindow?.enrollmentRound);
            }

            return rolesArray.length > 0;
        }
    };

    /**
     * @name getNameOfSelectedSchool
     * This is being used in the JSX for the text above the table in the paragraph
     * @returns the name of the selected school from the dropdown list
     */
    const getNameOfSelectedSchool = () => {
        if (formState.selectedSchoolId) {
            const { selectedSchoolId } = formState;

            const match = participatingSchools.filter((obj) => obj.key === selectedSchoolId);
            if (match && match.length > 0) {
                const { locationDto } = match[0];

                return locationDto?.name;
            }
        }
    };

    /**
     * Loops through oeActionControls roles to see if one of the following action control windows is open
     * "SCHOOL_OFFER_PENDING",
     * "SCHOOL_FINALIZE",
     * "SCHOOL_VIEW_ONLY",
     * "SCHOOL_VIEW_PARENT_OFFER"
     * @name hasActionControl
     * @param {[]} roles
     * @return {Boolean}
     */
    const hasActionControl = useCallback(
        (window) => {
            if (oeActionControls) {
                const windowsArray = oeActionControls?.reduce((results, value) => {
                    if (window === value.action) {
                        results.push(value.action);
                    }

                    return results;
                }, []);

                return windowsArray.length > 0;
            }
        },
        [oeActionControls]
    );

    /**
     * This method takes in a string that is snake_case (upper or lower)
     * and returns it in readable english (ex. Snake Case)
     * @name snakeToTitleCase
     * @param {*} str
     */
    const snakeToTitleCase = (str) => {
        const result = str
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        setToEnglish(result);
    };

    /**
     * Logic for setting the counts in the table
     */
    useEffect(() => {
        if (formState) {
            const { grades } = formState;

            let currentCounter = 0;
            let projectedCounter = 0;
            let availableCounter = 0;
            let enrolledCounter = 0;

            grades.forEach((item) => {
                // Ternary will stop footer from blowing up when input is empty
                currentCounter =
                    item.currentEnrollmentCount !== ""
                        ? currentCounter + parseInt(item.currentEnrollmentCount, 10)
                        : currentCounter;
                projectedCounter =
                    item.targetEnrollmentCount !== ""
                        ? projectedCounter + parseInt(item.targetEnrollmentCount, 10)
                        : projectedCounter;

                availableCounter = availableCounter + parseInt(item.availableCount, 10);
                enrolledCounter = enrolledCounter + parseInt(item.openEnrolledCount, 10);
            });

            setTotalsObj({ currentCounter, projectedCounter, availableCounter, enrolledCounter });
        }
    }, [formState]);

    /**
     * Logic for a selected school (from dropdown) has || !has "Available Slots" data
     */
    useEffect(() => {
        if (userDetails) {
            if (availableSlotsDto && availableSlotsDto.length > 0) {
                const tempFormState = formState;
                const tempGrades = availableSlotsDto.reduce((results, dto) => {
                    results.push(dto);

                    return results;
                }, []);
                tempFormState.grades = tempGrades;

                formDispatch({
                    type: "reset",
                    payload: { ...tempFormState }
                });
            }
            // ------------------------------------------------------------------------------------
            // If there is no available slots from a selected school
            else if (formState.selectedSchoolId) {
                const { selectedSchoolId } = formState;

                const match = participatingSchools.filter((obj) => obj.key === selectedSchoolId);
                if (match && match.length > 0) {
                    const { locationDto } = match[0];
                    if (locationDto) {
                        const { tags } = locationDto;
                        const match2 = tags.filter((obj) => obj.type === "GRADE");
                        if (match2 && match2.length > 0) {
                            const tempFormState = formState;
                            const tempGrades = match2.reduce((results, dto) => {
                                if (dto.tag !== "KINDERGARTEN") {
                                    const newDto = {
                                        availableCount: 0,
                                        createdByGuid: userDetails.uid,
                                        currentEnrollmentCount: 0,
                                        grade: dto.tag,
                                        key: null,
                                        lastUpdatedByGuid: userDetails.uid,
                                        openEnrolledCount: 0,
                                        participatingSchoolId: formState.selectedSchoolId,
                                        targetEnrollmentCount: 0
                                    };
                                    results.push(newDto);
                                }

                                return results;
                            }, []);

                            tempFormState.grades = tempGrades;
                            setAvailableSlotsDto(tempGrades);

                            formDispatch({
                                type: "reset",
                                payload: { ...tempFormState }
                            });
                        }
                    }
                }
            }
        }
        /* eslint-disable-next-line */
    }, [availableSlotsDto, participatingSchools, userDetails]);

    /**
     * Get the users predominate location if they have one
     */
    useEffect(() => {
        if (userDetails && token && !usersLocation) {
            const { userAttributeDto } = userDetails;
            if (userAttributeDto) {
                const { userAttributeMap } = userAttributeDto;
                if (userAttributeMap) {
                    if (userAttributeMap.CURRENT_PREDOMINANT_SCHOOL?.locationKey) {
                        setUsersLocation(parseInt(userAttributeMap.CURRENT_PREDOMINANT_SCHOOL?.locationKey, 10));
                    } else {
                        setUsersLocation(null);
                    }
                }
            }
        }
    }, [token, usersLocation, userDetails]);

    /**
     * Check for a users predominate location.
     * If they do not have one, pop up a dialog
     */
    useEffect(() => {
        if (token && usersLocation === null) {
            setOpen("no-predominate-location");
        }
    }, [token, usersLocation]);

    /**
     * Get the schoolYearKey and dispatch to state (contextProvider)
     * this call is from OE current district window
     */
    useEffect(() => {
        if (token && !oeActiveDistrictWindow) {
            setLoader(true);
            const options = {
                action: "oeActiveDistrictWindowRead",
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
                        dispatch({
                            type: "OeActiveDistrictWindow",
                            oeActiveDistrictWindow: payload
                        });
                    }
                    if (!payload || payload === null) {
                        setOpen("windows-closed");
                    }
                }
                setLoader(false);
            });
        }
    }, [dispatch, oeActiveDistrictWindow, token]);

    /**
     * Get the action control by schoolYearKey.
     * This is only for the text in above the table to show the end date
     */
    useEffect(() => {
        if (token && oeActiveDistrictWindow && !schoolSlotsDates) {
            const options = {
                action: "oeActionControlsByYear",
                schoolYearKey: oeActiveDistrictWindow.schoolYearKey,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
                        const match = payload.filter((obj) => obj.action === "SCHOOL_AVAILABLE_SLOTS");

                        if (match && match.length > 0) {
                            setSchoolSlotDates(match[0]); // this is just a date, not the whole object
                        }
                    }
                }
            });
        }
    }, [oeActiveDistrictWindow, schoolSlotsDates, token]);

    /**
     * Get the Action Controls for Open Enrollment
     */
    useEffect(() => {
        if (oeActiveDistrictWindow && token && !oeActionControls) {
            setLoader(true);
            const options = {
                action: "oeActionControls",
                params: {
                    differentiator: oeActiveDistrictWindow.key
                },
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload && payload.length > 0) {
                        setOeActionControls(payload);
                        // if action is SchoolAvailable slots then disable the page
                        const match = payload.filter((obj) => obj.action === "SCHOOL_AVAILABLE_SLOTS");
                        if (match && match?.length > 0) {
                            setLockPage(false);
                        } else {
                            setLockPage(true);
                        }
                    }
                }

                setLoader(false);
            });
        }
    }, [token, oeActionControls, oeActiveDistrictWindow]);

    /**
     * This is checking the actionControl actions and sending them through the hasActionControl method (true / false) for rendering.
     */
    useEffect(() => {
        if (oeActionControls && !renderActionControl) {
            if (hasActionControl("SCHOOL_OFFER_PENDING")) {
                setRenderActionControl(true);
            }
            if (hasActionControl("SCHOOL_FINALIZE")) {
                setRenderActionControl(true);
            }
            if (hasActionControl("SCHOOL_VIEW_ONLY")) {
                setRenderActionControl(true);
            }
        }
    }, [hasActionControl, oeActionControls, renderActionControl]);

    /**
     * Get a list of participating schools for the dropdown at the top of the page
     * If Admin we will show all schools
     * If Non-Admin only show their predominate school location
     */
    useEffect(() => {
        if (oeActiveDistrictWindow && token && userDetails && !participatingSchools) {
            let options = null;
            if (hasRole(["OPEN_ENROLLMENT_ADMIN"], 1)) {
                options = {
                    action: "oeAdminParticipatingSchools",
                    params: {
                        fetchLocationData: true
                    },
                    schoolYearKey: oeActiveDistrictWindow?.schoolYearKey,
                    token
                };
            } else if (hasRole(["PRINCIPAL", "REGISTRAR"], 1)) {
                const { userAttributeDto } = userDetails;
                if (userAttributeDto) {
                    const { userAttributeMap } = userAttributeDto;
                    if (userAttributeMap) {
                        if (userAttributeMap.CURRENT_PREDOMINANT_SCHOOL?.locationKey) {
                            setUsersLocation(parseInt(userAttributeMap.CURRENT_PREDOMINANT_SCHOOL?.locationKey, 10));
                            options = {
                                action: "oeNonAdminParticipatingSchool",
                                params: {
                                    fetchLocationData: true
                                },
                                schoolId: parseInt(userAttributeMap.CURRENT_PREDOMINANT_SCHOOL?.locationKey, 10),
                                schoolYearKey: oeActiveDistrictWindow.schoolYearKey,
                                token
                            };
                        } else {
                            setUsersLocation(null);
                        }
                    }
                }
            }
            if (options) {
                OpenEnrollmentDao(options).then((response) => {
                    if (response) {
                        const { payload } = response.data;
                        if (payload) {
                            payload.sort((a, b) => {
                                if (a.locationDto.name > b.locationDto.name) return 1;
                                if (a.locationDto.name < b.locationDto.name) return -1;
                                if (a.locationDto.educationalTrack > b.locationDto.educationalTrack) return 1;
                                if (a.locationDto.educationalTrack < b.locationDto.educationalTrack) return -1;
                            });
                            setParticipatingSchools(payload);

                            if (payload.length > 0) {
                                let tempFormState = formState;
                                tempFormState.selectedSchoolId = payload[0].key;

                                if (payload[0].educationalTrack !== "NOT_APPLICABLE") {
                                    setShowDash(true);
                                    snakeToTitleCase(payload[0].educationalTrack);
                                } else {
                                    setShowDash(false);
                                }

                                formDispatch({
                                    type: "reset",
                                    payload: { ...tempFormState }
                                });
                            }
                        }
                    }
                });
            }
        }
        /* eslint-disable-next-line */
    }, [formDispatch, hasRole, oeActiveDistrictWindow, participatingSchools, token, userDetails, usersLocation]);

    /**
     * Get the available slots from the participating school (pass the id)
     */
    useEffect(() => {
        if (formState.selectedSchoolId && token) {
            const options = {
                action: "oeAdminSelectedSchoolDetails",
                params: {
                    fetchLocationData: true
                },
                schoolId: formState.selectedSchoolId ? formState.selectedSchoolId : participatingSchools[0].key,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
                        payload.sort((a, b) => {
                            return stringGradeOrdinal[a.grade] > stringGradeOrdinal[b.grade] ? 1 : -1;
                        });
                        setAvailableSlotsDto(payload);
                    }
                }
            });
        }
    }, [formState.selectedSchoolId, participatingSchools, token]);

    return (
        <RbA allowedRoles={allowedRolesArray} redirect="/notFound">
            <Header />
            <ToastContainer style={{ width: "50%" }} />
            <div className="gutter-90">
                <Toolbar label="Manage School Enrollment Numbers" showBackButton />
                <div className="participating-schools-container">
                    <div className="input-container">
                        <label id="label" htmlFor="state">
                            Select a school from the list: *
                        </label>
                        <select
                            aria-label="selected school ID"
                            className="participating-schools-dropdown"
                            id="selectedSchoolId"
                            name="selectedSchoolId"
                            onChange={handleChange}
                            required
                            value={formState?.selectedSchoolId || ""}
                        >
                            {participatingSchools && (
                                <>
                                    {hasRole(["OPEN_ENROLLMENT_ADMIN"], 1) && <option value="">-</option>}
                                    {participatingSchools.map((obj, index) => {
                                        const optionKey = `opt-${index}`;
                                        const { educationalTrack, locationDto } = obj;

                                        // Show BAYOU_GULCH and STROH_RANCH
                                        if (!["NOT_APPLICABLE"].includes(obj.educationalTrack)) {
                                            return (
                                                <option key={optionKey} value={obj.key}>
                                                    {locationDto?.name} - {enumToEnglish(educationalTrack)}
                                                </option>
                                            );
                                        }
                                        // Show all other participating schools
                                        return (
                                            <option key={optionKey} value={obj.key}>
                                                {locationDto?.name}
                                            </option>
                                        );
                                    })}
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* Admin need to select a participating school to show table of results */}
                {formState.selectedSchoolId && (
                    <>
                        {schoolSlotsDates && (
                            <div>
                                <h4 className="no-data-message-heading">
                                    Please enter School Enrollment Values for{" "}
                                    <span className="bold-schoolName">{getNameOfSelectedSchool()}</span>
                                    {showDash && <span className="bold-schoolName"> - {toEnglish}</span>}
                                    <span className="date-range">
                                        from&nbsp;
                                        {formatDateAndTime(schoolSlotsDates?.startDate)}&nbsp; - &nbsp;
                                        {formatDateAndTime(schoolSlotsDates.endDate)}
                                    </span>
                                </h4>
                                <p className="no-data-message">
                                    When you enter the <strong>Current Enrollment</strong> and{" "}
                                    <strong>Projected Enrollment</strong> for each grade,{" "}
                                    <em>
                                        <u>
                                            the system will automatically calculate the Available Slots for Open
                                            Enrollment
                                        </u>
                                    </em>
                                    . Based on the Available Slots by grade, the system can automatically make Round 1
                                    offers based on Open Enrollment applications for the school after the parent window
                                    closes on <strong>{formatDateAndTime(schoolSlotsDates.endDate)}</strong>.
                                </p>
                            </div>
                        )}
                        <div className="data-container">
                            <br />
                            {availableSlotsDto && availableSlotsDto.length > 0 && (
                                <div>
                                    <AvailableSlotsHeader />
                                    {formState.grades.map((dto, index) => {
                                        const uniqueKey = `avail-slot-${index}`;
                                        return (
                                            <div key={uniqueKey} style={{ background: "white" }}>
                                                <AvailableSlotsRow
                                                    dto={dto}
                                                    handleNumberChange={handleNumberChange}
                                                    lockPage={lockPage}
                                                />
                                            </div>
                                        );
                                    })}
                                    <AvailableSlotsFooter totalsObj={totalsObj} />
                                </div>
                            )}
                        </div>
                        {!lockPage && (
                            <div className="save-container">
                                <ActionButton className="action-button-200" label="Save" onClick={handleSubmit} />
                            </div>
                        )}
                    </>
                )}
                <DcsdDialog
                    actions={getBackToDialogActions()}
                    ariaLabel="Must have primary school location dialog"
                    hasCloseX={false}
                    id="no-predominate-location"
                    onHide={() => {
                        setOpen("false");
                    }}
                    open={open}
                    title="Your Predominant Location is not set"
                >
                    <div>Please set your Predominant School Location to view the Open Enrollment Manager. </div>
                </DcsdDialog>
                <WindowAndPermissionDialog
                    id="windows-closed"
                    open={open}
                    sorryTitle="Open Enrollment Manager is now closed"
                    sorryMessage="Sorry, the Open Enrollment Manager is currently unavailable. Please return during Round 1 or Round 2 windows."
                />
                {loader && <LoadingSvg />}
            </div>
        </RbA>
    );
};

export default Numbers;
