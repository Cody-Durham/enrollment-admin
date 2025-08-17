import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RbA from "../components/rba/RbA.jsx";
import { ToastContainer } from "react-toastify";
import { GlobalContext } from "../components/contextProvider/ContextProvider.jsx";
import OpenEnrollmentDao from "../dao/OpenEnrollmentDao.jsx";
import Header from "../components/Header.jsx";
import Toolbar from "../components/Toolbar.jsx";
import AdminComponent from "../components/formComponents/AdminComponent.jsx";
import WindowAndPermissionDialog from "../components/modals/WindowAndPermissionDialog.jsx";
import LoadingSvg from "../components/loadingSvg/LoadingSvg.jsx";

import "react-toastify/dist/ReactToastify.css";
import "../styles/global/Global.scss";

/**
 * This will render the form and components for showing and submitting a new Open Enrollment record
 * Existing & External Guardian + New Student (IC data save to OE data)
 * @name StudentNew
 * @returns {JSX.Element}
 */
const Home = () => {
    const { dispatch, state } = useContext(GlobalContext);
    const { oeActiveDistrictWindow, participatingSchools, token, userDetails } = state;

    const navigate = useNavigate();

    const allowedRolesArray = ["OPEN_ENROLLMENT_ADMIN", "REGISTRAR", "PRINCIPAL"];

    const [availableSlotsDto, setAvailableSlotsDto] = useState(null);
    const [availableSlotsFlag, setAvailableSlotsFlag] = useState(true);
    const [slotsWarning, setSlotsWarning] = useState(false);
    const [loader, setLoader] = useState(false);
    const [oeActionControls, setOeActionControls] = useState(null);
    const [open, setOpen] = useState("false");
    const [renderActionControl, setRenderActionControl] = useState(false);

    /**
     * @name handleRouting
     * @returns
     */
    const handleRouting = (e) => {
        const { name } = e.target;

        if (name === "choices") {
            navigate("/choices");
        }
        if (name === "numbers") {
            navigate("/numbers");
        }
        if (name === "students") {
            navigate("/students");
        }
        if (name === "timeline") {
            navigate("/timeline");
        }
    };

    /**
     * Loops through userDetails roles to evaluate permissions for page links
     * @name hasRole
     * @param {[]} roles
     * @param {bool} window
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
                    if (window.includes(value.action)) {
                        results.push(value.action);
                    }

                    return results;
                }, []);

                return windowsArray.length > 0;
            }
        },
        [oeActionControls]
    );

    const showRequests = () => {
        if (hasRole(["OPEN_ENROLLMENT_ADMIN"], 1)) {
            return true;
        } else if (hasRole(["PRINCIPAL", "REGISTRAR"]) && renderActionControl) {
            return true;
        }

        return false;
    };

    /**
     * Get a list of participating schools for the dropdown at the top of the page
     * If Admin we will show all schools
     * If Non-Admin only show their predominate school location
     */
    useEffect(() => {
        if (oeActiveDistrictWindow && token && userDetails && !participatingSchools) {
            let options = null;

            if (hasRole(["PRINCIPAL", "REGISTRAR"], 1)) {
                const { userAttributeDto } = userDetails;
                if (userAttributeDto) {
                    const { userAttributeMap } = userAttributeDto;
                    if (userAttributeMap) {
                        if (userAttributeMap.CURRENT_PREDOMINANT_SCHOOL?.locationKey) {
                            options = {
                                action: "oeNonAdminParticipatingSchool",
                                params: {
                                    fetchLocationData: true
                                },
                                schoolId: parseInt(userAttributeMap.CURRENT_PREDOMINANT_SCHOOL?.locationKey, 10),
                                schoolYearKey: oeActiveDistrictWindow.schoolYearKey,
                                token
                            };
                        }
                    }
                }
            }
            if (options) {
                OpenEnrollmentDao(options).then((response) => {
                    if (response) {
                        const { payload } = response.data;
                        if (payload) {
                            dispatch({
                                type: "ParticipatingSchools",
                                participatingSchools: payload
                            });
                        }
                    }
                });
            }
        }
        /* eslint-disable-next-line */
    }, [dispatch, oeActiveDistrictWindow, participatingSchools, token, userDetails]);

    /**
     * Get the available slots from the participating school (pass the id)
     */
    useEffect(() => {
        if (token && userDetails && participatingSchools && availableSlotsFlag && !availableSlotsDto) {
            setAvailableSlotsFlag(false);
            const nonAdmin = !hasRole(["OPEN_ENROLLMENT_ADMIN"]); // => true / false
            if (nonAdmin) {
                const { userAttributeDto } = userDetails;
                if (userAttributeDto) {
                    const { userAttributeMap } = userAttributeDto;
                    if (userAttributeMap) {
                        const { CURRENT_PREDOMINANT_SCHOOL } = userAttributeMap;
                        if (CURRENT_PREDOMINANT_SCHOOL) {
                            const options = {
                                action: "oeAdminSelectedSchoolDetails",
                                params: {
                                    fetchLocationData: true
                                },
                                schoolId: participatingSchools[0].key,
                                token
                            };
                            setLoader(true);
                            OpenEnrollmentDao(options).then((response) => {
                                if (response) {
                                    const { payload } = response.data;
                                    if (payload && payload.length > 0) {
                                        setAvailableSlotsDto(payload);
                                    } else setSlotsWarning(true);
                                }
                                setLoader(false);
                            });
                        }
                    }
                }
            }
        }
        /* eslint-disable-next-line */
    }, [availableSlotsDto, availableSlotsFlag, dispatch, loader, participatingSchools, token, userDetails]);

    /**
     * This call is from OE current district window and dispatching it to state (contextProvider)
     */
    useEffect(() => {
        if (token && !oeActiveDistrictWindow) {
            const options = {
                action: "oeActiveDistrictWindowRead",
                token
            };
            setLoader(true);
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
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
    }, [dispatch, oeActiveDistrictWindow, token]);

    /**
     * Get the Action Controls for Open Enrollment
     */
    useEffect(() => {
        if (oeActiveDistrictWindow && token && !oeActionControls) {
            const options = {
                action: "oeActionControls",
                params: {
                    differentiator: oeActiveDistrictWindow.key
                },
                token
            };
            setLoader(true);
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
                        setOeActionControls(payload);
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
            if (
                hasActionControl([
                    "SCHOOL_VIEW_PARENT_OFFER",
                    "SCHOOL_VIEW_ONLY",
                    "SCHOOL_FINALIZE",
                    "SCHOOL_OFFER_PENDING"
                ])
            ) {
                setRenderActionControl(true);
            }
        }
    }, [hasActionControl, oeActionControls, renderActionControl]);

    return (
        <RbA allowedRoles={allowedRolesArray} redirect="/notFound">
            <Header userDetails={userDetails} />
            <ToastContainer style={{ width: "50%" }} />
            <div className="gutter-95">
                <Toolbar label="Open Enrollment Manager" />
                <div>Use this tool to review Open Enrollment requests and make parent offers for your school.</div>
                {showRequests() && (
                    <>
                        <hr />
                        <AdminComponent
                            handleRouting={handleRouting}
                            header="Manage OE Requests"
                            icon="HAMBURGER"
                            message1="View and disposition OE requests for your school"
                            name="choices"
                            userDetails={userDetails}
                        />
                    </>
                )}
                {hasRole(["OPEN_ENROLLMENT_ADMIN", "PRINCIPAL", "REGISTRAR"], 1) && (
                    <>
                        <hr />
                        {slotsWarning ? (
                            <AdminComponent
                                availableSlotsMessage="School enrollment not yet entered"
                                handleRouting={handleRouting}
                                slotsWarning={slotsWarning}
                                header="Manage School Enrollment Numbers"
                                icon="DOCUMENT"
                                message1="View and edit available slots at your school"
                                name="numbers"
                            />
                        ) : (
                            <AdminComponent
                                handleRouting={handleRouting}
                                header="Manage School Enrollment Numbers"
                                icon="DOCUMENT"
                                message1="View and edit available slots at your school"
                                name="numbers"
                            />
                        )}
                    </>
                )}
                {hasRole(["OPEN_ENROLLMENT_ADMIN"], 1) && (
                    <>
                        <hr />
                        <AdminComponent
                            handleRouting={handleRouting}
                            header="Manage OE Students"
                            icon="PERSON_WAVING"
                            message1="New to DCSD Students - view and update student name, current grade and applying to grade"
                            message2="All OE Students - view and override location check"
                            name="students"
                        />
                    </>
                )}
                {hasRole(["OPEN_ENROLLMENT_ADMIN", "PRINCIPAL", "REGISTRAR"], 1) && (
                    <>
                        <hr />
                        <AdminComponent
                            handleRouting={handleRouting}
                            header="View Action Control Windows"
                            icon="CLOCK"
                            message1="View Open Enrollment action control window by action and by round"
                            name="timeline"
                        />
                    </>
                )}
                <hr />
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

export default Home;
