import React, { Fragment, useCallback, useContext, useEffect, useState } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import PropTypes from "prop-types";
import Tooltip from "react-bootstrap/Tooltip";

import EditNoteForm from "../formComponents/EditNoteForm";
import OpenEnrollmentDao from "../../dao/OpenEnrollmentDao";
import Pager from "../formComponents/facetedSearch/Pager";

import { GlobalContext } from "../contextProvider/ContextProvider";

/**
 * Display a table of school choice requests
 * @name RequestsTable
 * @param {func} editRequest
 * @param {{}} facetPagination
 * @param {bool} isOeAdmin
 * @param {{}} oeActionControls
 * @param {[]} requests
 * @param {func} setLoader
 * @param {func} setOpen
 * @param {func} setPageNum
 * @param {[]} siblings
 * @return {JSX.Element}
 */
const RequestsTable = ({
    editRequest,
    facetPagination,
    isOeAdmin,
    oeActionControls,
    requests,
    setLoader,
    setOpen,
    setPageNum,
    siblings
}) => {
    const { dispatch, state } = useContext(GlobalContext);
    const { oeActiveDistrictWindow, token } = state;

    const [editNote, setEditNote] = useState([]);
    const [expanded, setExpanded] = useState([]);
    const [hideOperations, setHideOperations] = useState(false);

    const headers = [
        "Score",
        "Student",
        "Guardian",
        "Student Birthdate",
        "Current Grade",
        "Grade Applying",
        "Kinder Choice",
        "Kinder Offer",
        "Language Choice",
        "Language Offer",
        "Current Enrollment",
        "Feeder Location",
        "Status",
        "Operations",
        "Notes"
    ];

    /**
     * OPEN_ENROLLMENT_ADMINS can see all schools - Here we add the school choice column
     */
    const idx = headers.findIndex((item) => item === "Kinder Choice");
    if (idx !== -1 && isOeAdmin()) {
        headers.splice(idx, 0, "School Choice");
    }

    /**
     * an OE Admin sees an additional column for schoolChoice
     */
    let colSpan = headers.length;

    if (hideOperations) {
        const i = headers.findIndex((item) => item === "Operations");
        if (i !== -1) {
            headers.splice(i, 1);
            colSpan = headers.length;
        }
    }

    /**
     * Show a tooltip displaying the student's name and any notes associated with the request
     * @name getTooltip
     * @param {{}} req
     * @return {node}
     */
    const getTooltip = (req) => {
        return (
            <div className="tool-tip-container">
                <h6 style={{ fontWeight: "600", textDecoration: "underline" }}>
                    {req.firstName} {req.lastName}
                </h6>
                <div style={{ textAlign: "left" }}>
                    <b>Notes:</b> <span>{req.notes}</span>
                </div>
            </div>
        );
    };

    const getOperationDisplay = useCallback(
        (statDisplay) => {
            switch (statDisplay.toLowerCase()) {
                case "make offer pending":
                    return isOeAdmin() ? "Make Offer" : "Cancel Pending Offer";
                case "accepted offer":
                    return "Enroll";
                case "request made":
                    return "Make Pending Offer";
                default:
                    return statDisplay;
            }
        },
        [isOeAdmin]
    );

    const getRound = useCallback(
        (round) => {
            if (oeActiveDistrictWindow) {
                return oeActiveDistrictWindow.enrollmentRound === round;
            }

            return false;
        },
        [oeActiveDistrictWindow]
    );

    /**
     * Return a logical english action for the status
     * @name getStatusDisplay
     * @param {string} statDisplay
     * @return {string}
     */
    const getStatusDisplay = (statDisplay) => {
        switch (statDisplay.toLowerCase()) {
            case "make offer pending":
                return "Offer Pending";
            case "make offer":
                return "Offer Made";
            case "request made":
                return "Request Made";
            case "on wait list":
                return "On Wait List";
            default:
                return statDisplay;
        }
    };

    /**
     * Display or hide the request's notes in an additional row
     * @name handleClick
     * @param {string} action
     * @param {string} key
     */
    const handleClick = (action, key) => {
        let tmpExpanded = expanded;
        if (action === "show") {
            tmpExpanded.push(key);
        } else {
            const filtered = expanded.filter((item) => parseInt(item, 10) !== parseInt(key, 10));
            tmpExpanded = filtered;
        }
        setExpanded([...tmpExpanded]);
    };

    /**
     * Alter the editNote state
     * @name getNoted
     * @param {string} key
     */
    const getNoted = (key) => {
        const tmpEditNote = editNote || [];
        tmpEditNote.push(key);
        setEditNote([...tmpEditNote]);
    };

    /**
     * Does a note exist and is it already open?
     * @name isNoted
     * @callback
     * @return {bool}
     */
    const isNoted = useCallback(
        (key) => {
            if (editNote && editNote.length > 0) {
                const result = editNote.find((item) => parseInt(item, 10) === parseInt(key, 10));

                return result ? true : false;
            }

            return false;
        },
        [editNote]
    );

    /**
     * onLoad, expand the notes row if any notes exist
     * @name showHide
     * @callback
     * @param {string} key
     * @return {bool}
     */
    const showHide = useCallback(
        (key) => {
            const match = expanded?.filter((item) => parseInt(item, 10) === parseInt(key, 10));

            return match && match.length > 0;
        },
        [expanded]
    );

    /**
     * Return an appropriate node for the status and window
     * @name showOperations
     * @callback
     * @return {node|null}
     */
    const showOperations = useCallback(
        (request) => {
            if (oeActionControls) {
                if (getRound("ROUND1")) {
                    if (["MAKE_OFFER_PENDING", "REQUEST"].includes(request.status)) {
                        let actionMatch = [];
                        if (isOeAdmin()) {
                            actionMatch = oeActionControls.filter((obj) => obj.action === "ADMIN_OFFER_CONFIRM");
                        } else {
                            actionMatch = oeActionControls.filter((obj) => obj.action === "SCHOOL_OFFER_PENDING");
                        }

                        if (actionMatch && actionMatch.length > 0) {
                            return (
                                <button
                                    aria-label="edit operation"
                                    className="btn btn-primary small"
                                    name="editOperation"
                                    onClick={() => editRequest("edit-operation", request)}
                                    type="button"
                                >
                                    {getOperationDisplay(request.statusDisplayName)}
                                </button>
                            );
                        }
                    } else if (request.status === "ACCEPT_OFFER") {
                        const acceptedMatch = oeActionControls.filter((obj) => obj.action === "SCHOOL_FINALIZE");
                        if (acceptedMatch && acceptedMatch.length > 0) {
                            if (request.gradeApplying === "K" || request.studentNumber === null) {
                                return (
                                    <button
                                        aria-label="enroll button"
                                        className="btn btn-primary small"
                                        name="editEnroll"
                                        onClick={() => editRequest("enroll", request)}
                                        type="button"
                                    >
                                        {getOperationDisplay(request.statusDisplayName)}
                                    </button>
                                );
                            }
                        }
                    }
                } else if (getRound("ROUND2")) {
                    if (request.status !== "NO_RESPONSE") {
                        // Make Offer is now a viable status for Round 2
                        if (["MAKE_OFFER", "WAIT_LIST", "REQUEST", "ACCEPT_OFFER"].includes(request.status)) {
                            return (
                                <>
                                    {!["MAKE_OFFER", "ACCEPT_OFFER"].includes(request.status) ? (
                                        <button
                                            aria-label="Make Offer button"
                                            className="btn btn-primary fixed-btn small"
                                            name="editOperation"
                                            onClick={() => editRequest("edit-operation", request)}
                                            type="button"
                                        >
                                            Make Offer
                                        </button>
                                    ) : (
                                        request.status === "MAKE_OFFER" && (
                                            <button
                                                aria-label="Accepted Offer button"
                                                className="btn btn-primary fixed-btn small"
                                                name="editOperation"
                                                onClick={() => editRequest("edit-status", request, "ACCEPT_OFFER")}
                                                type="button"
                                            >
                                                Accepted Offer
                                            </button>
                                        )
                                    )}
                                    <button
                                        aria-label="Denied Offer button"
                                        className="btn btn-primary fixed-btn small"
                                        name="editStatus"
                                        onClick={() => editRequest("edit-status", request, "DENY_OFFER")}
                                        type="button"
                                    >
                                        Denied Offer
                                    </button>
                                    <button
                                        aria-label="No Response button"
                                        className="btn btn-primary fixed-btn small"
                                        name="editOperation"
                                        onClick={() => editRequest("edit-status", request, "NO_RESPONSE")}
                                        type="button"
                                    >
                                        No Response
                                    </button>
                                    <button
                                        aria-label="enroll button"
                                        className="btn btn-primary fixed-btn small"
                                        name="editEnroll"
                                        onClick={() => editRequest("enroll", request)}
                                        type="button"
                                    >
                                        Enroll
                                    </button>
                                </>
                            );
                        }
                    } else {
                        return (
                            <>
                                <button
                                    aria-label="Accepted Offer button"
                                    className="btn btn-primary fixed-btn small"
                                    name="editOperation"
                                    onClick={() => editRequest("edit-status", request, "ACCEPT_OFFER")}
                                    type="button"
                                >
                                    Accepted Offer
                                </button>
                                <button
                                    aria-label="Denied Offer button"
                                    className="btn btn-primary fixed-btn small"
                                    name="editEnroll"
                                    onClick={() => editRequest("edit-status", request, "DENY_OFFER")}
                                    type="button"
                                >
                                    Denied Offer
                                </button>
                                <button
                                    aria-label="enroll button"
                                    className="btn btn-primary fixed-btn small"
                                    name="editEnroll"
                                    onClick={() => editRequest("enroll", request)}
                                    type="button"
                                >
                                    Enroll
                                </button>
                                <button
                                    aria-label="enroll button"
                                    className="btn btn-primary fixed-btn small"
                                    name="editEnroll"
                                    onClick={() => editRequest("edit-status", request, "WAIT_LIST")}
                                    type="button"
                                >
                                    Wait List
                                </button>
                            </>
                        );
                    }
                }
            }

            return null;
        },
        [editRequest, getOperationDisplay, getRound, isOeAdmin, oeActionControls]
    );

    /**
     * Init the expanded array
     */
    useEffect(() => {
        const exp = requests.reduce((results, dto) => {
            if (dto.notes?.length > 0) {
                results.push(dto.key);
            }

            return results;
        }, []);

        setExpanded([...exp]);
    }, [requests]);

    /**
     * If the appropriate window is closed, hide the operations column
     */
    useEffect(() => {
        if (oeActionControls) {
            let actionMatch = [];
            if (getRound("ROUND1")) {
                if (isOeAdmin()) {
                    actionMatch = oeActionControls.filter((obj) =>
                        ["ADMIN_OFFER_CONFIRM", "SCHOOL_FINALIZE", "SCHOOL_YEAR_EXTENSION_WINDOW"].includes(obj.action)
                    );
                } else {
                    actionMatch = oeActionControls.filter((obj) =>
                        ["SCHOOL_OFFER_PENDING", "SCHOOL_FINALIZE", "SCHOOL_YEAR_EXTENSION_WINDOW"].includes(obj.action)
                    );
                }
            } else if (getRound("ROUND2")) {
                actionMatch = oeActionControls.filter((obj) => ["SCHOOL_FINALIZE"].includes(obj.action));
            }
            setHideOperations(!(actionMatch && actionMatch.length > 0));
        }
    }, [getRound, isOeAdmin, oeActionControls]);

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
    }, [dispatch, oeActiveDistrictWindow, setLoader, setOpen, token]);

    return (
        <table className="mt-4">
            <thead className="sticky-top z-1">
                <tr>
                    <th className="icon-header">*</th>
                    {headers.map((header, index) => {
                        const uniqueKey = `header-${index}`;
                        return <th key={uniqueKey}>{header}</th>;
                    })}
                </tr>
            </thead>
            <tbody>
                {requests.length > 0 &&
                    requests.map((request, index) => {
                        const uniqueKey = `request-${request.key}-${index}`;
                        let oodClass = request.studentNumber ? "" : "out-of-district";
                        if (
                            parseInt(request.schoolChoiceLocationKey, 10) ===
                                parseInt(request.studentFeederLocationKey, 10) ||
                            parseInt(request.schoolChoiceLocationKey, 10) === parseInt(request.studentLocationKey, 10)
                        ) {
                            oodClass = "out-of-district";
                        }
                        let sib = false;
                        const {
                            educationalTrack,
                            currentGrade,
                            displayBirthdate,
                            firstName,
                            gradeApplying,
                            key,
                            kinderChoiceList,
                            kinderOffer,
                            languageChoiceList,
                            languageOffer,
                            lastName,
                            macantaResident,
                            notes,
                            parentEmail,
                            parentFirstname,
                            parentLastname,
                            parentUsername,
                            parentTelephoneNumber,
                            schoolChoiceSchoolName,
                            schoolChoiceScore,
                            status,
                            statusDisplayName,
                            studentFeederLocationName,
                            studentIepStatus,
                            studentNumber,
                            studentSchoolName
                        } = request;
                        const schoolChoiceName =
                            educationalTrack !== "Not Applicable"
                                ? `${schoolChoiceSchoolName} - ${educationalTrack}`
                                : schoolChoiceSchoolName;
                        if (siblings && siblings.length > 0) {
                            sib = siblings.includes(key);
                        }
                        const parentName =
                            ["", null].includes(parentFirstname) && ["", null].includes(parentLastname)
                                ? "Parent name not found."
                                : `${parentFirstname} ${parentLastname}`;
                        const iconNoteClass = showHide(key) ? "icons-with-note" : "icons";
                        const scoreDisplay = schoolChoiceScore > -1 ? schoolChoiceScore : "NA";
                        return (
                            <Fragment key={uniqueKey}>
                                <tr className={oodClass} key={uniqueKey}>
                                    <td className={iconNoteClass} align="center">
                                        {sib && (
                                            <div className="sibling">
                                                <i className="bi bi-people-fill" style={{ fontSize: "1.2rem" }} />
                                            </div>
                                        )}
                                        {macantaResident === "true" && <div className="macanta">M</div>}
                                        {studentIepStatus === "true" && isOeAdmin() && <div className="iep">IEP</div>}
                                    </td>
                                    <td className="center first">
                                        <button
                                            aria-label="edit score"
                                            className="btn btn-transparent"
                                            name="editScore"
                                            onClick={() => editRequest("edit-score", request)}
                                            type="button"
                                        >
                                            <span style={{ marginRight: "4px" }}>{scoreDisplay}</span>
                                            <i className="bi bi-pencil-square" />
                                        </button>
                                    </td>
                                    <td>
                                        {firstName} {lastName}
                                        <br />
                                        {studentNumber}
                                    </td>
                                    <td>
                                        {parentName}
                                        <br />
                                        {parentEmail}
                                        <br />
                                        {parentUsername}
                                        <br />
                                        {parentTelephoneNumber}
                                    </td>
                                    <td>{displayBirthdate}</td>
                                    <td>{currentGrade}</td>
                                    <td>{gradeApplying}</td>
                                    {isOeAdmin() && <td>{schoolChoiceName}</td>}
                                    <td>
                                        {kinderChoiceList &&
                                            kinderChoiceList.map((item, index) => {
                                                const kinderKey = `kinder-choice-${index}`;
                                                return (
                                                    <div key={kinderKey} style={{ whiteSpace: "nowrap" }}>
                                                        {index + 1}: {item.replace(/_/g, " ")}
                                                        <br />
                                                    </div>
                                                );
                                            })}
                                    </td>
                                    <td>
                                        {kinderOffer && (
                                            <div style={{ whiteSpace: "nowrap" }}>{kinderOffer.replace(/_/g, " ")}</div>
                                        )}
                                    </td>
                                    <td>
                                        {languageChoiceList &&
                                            languageChoiceList.map((item, index) => {
                                                const languageKey = `language-choice-${index}`;
                                                return (
                                                    <div key={languageKey} style={{ whiteSpace: "nowrap" }}>
                                                        {index + 1}: {item.replace(/_/g, " ")}
                                                        <br />
                                                    </div>
                                                );
                                            })}
                                    </td>
                                    <td>{languageOffer}</td>
                                    <td>{studentSchoolName}</td>
                                    <td>{studentFeederLocationName}</td>
                                    <td>
                                        <div className="flexed-td">
                                            <div className={`${status}`} />
                                            {isOeAdmin() ? (
                                                <button
                                                    aria-label="edit status"
                                                    className="btn btn-transparent btn-sm"
                                                    name="editStatus"
                                                    onClick={() => editRequest("edit-status", request)}
                                                    type="button"
                                                >
                                                    {getStatusDisplay(statusDisplayName)}{" "}
                                                    <i className="bi bi-pencil-square" />
                                                </button>
                                            ) : (
                                                getStatusDisplay(statusDisplayName)
                                            )}
                                        </div>
                                    </td>
                                    {!hideOperations && <td align="center">{showOperations(request)}</td>}
                                    <td className="center last">
                                        <div>
                                            {showHide(key) ? (
                                                <button
                                                    aria-label="hide note"
                                                    className="btn btn-transparent"
                                                    name="hideNote"
                                                    onClick={() => handleClick("hide", key)}
                                                    type="button"
                                                >
                                                    <i
                                                        className="bi bi-caret-up-fill"
                                                        style={{ color: "#097969", fontSize: "1.2rem" }}
                                                    />
                                                </button>
                                            ) : notes?.length > 0 ? (
                                                <OverlayTrigger
                                                    delay={{ hide: 5, show: 300 }}
                                                    overlay={(props) => (
                                                        <Tooltip className="tooltip-window" {...props}>
                                                            {getTooltip(request)}
                                                        </Tooltip>
                                                    )}
                                                    placement="top"
                                                >
                                                    <button
                                                        aria-label="show note"
                                                        className="btn btn-transparent"
                                                        name="showNote"
                                                        onClick={() => handleClick("show", key)}
                                                        type="button"
                                                    >
                                                        <i
                                                            className="bi bi-file-text-fill"
                                                            style={{ color: "#097969", fontSize: "1.2rem" }}
                                                        />
                                                    </button>
                                                </OverlayTrigger>
                                            ) : (
                                                <button
                                                    aria-label="create note"
                                                    className="btn btn-transparent"
                                                    name="toggleShow"
                                                    onClick={() => handleClick("show", key)}
                                                    type="button"
                                                >
                                                    <i
                                                        className="bi bi-plus-circle-fill"
                                                        style={{ color: "#097969", fontSize: "1.2rem" }}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {showHide(key) && (
                                    <tr className={`${oodClass}`} key={`${uniqueKey}-notes`}>
                                        <td className="icons" />
                                        <td className="first last notes" colSpan={colSpan}>
                                            <h6>
                                                Notes on{" "}
                                                <b>
                                                    <u>
                                                        {firstName} {lastName}
                                                    </u>
                                                </b>{" "}
                                                from <i>{schoolChoiceName}</i>:
                                            </h6>
                                            {notes && notes.length > 0 && !isNoted(key) ? (
                                                <>
                                                    <div>{notes}</div>
                                                    <div>
                                                        <button
                                                            aria-label="edit note"
                                                            className="btn btn-primary small"
                                                            name="toggleEdit"
                                                            onClick={() => {
                                                                getNoted(key);
                                                            }}
                                                            type="button"
                                                        >
                                                            Edit Note
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <EditNoteForm
                                                    editNote={editNote}
                                                    handleClick={handleClick}
                                                    selectedRequest={request}
                                                    setEditNote={setEditNote}
                                                    setLoader={setLoader}
                                                    showHide={showHide}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                {requests.length === 0 && (
                    <tr>
                        <td className="icons"></td>
                        <td className="center first last" colSpan={colSpan}>
                            <div>No Requests Found</div>
                        </td>
                    </tr>
                )}
            </tbody>
            <tfoot>
                <tr>
                    <td className="icons" align="center" />
                    <td colSpan={colSpan}>
                        {facetPagination && requests.length > 0 && (
                            <div>
                                <Pager facetPagination={facetPagination} setPageNum={setPageNum} />
                            </div>
                        )}
                    </td>
                </tr>
            </tfoot>
        </table>
    );
};

RequestsTable.propTypes = {
    editRequest: PropTypes.func.isRequired,
    facetPagination: PropTypes.oneOfType([PropTypes.object]).isRequired,
    isOeAdmin: PropTypes.func.isRequired,
    oeActionControls: PropTypes.instanceOf(Array),
    requests: PropTypes.instanceOf(Array),
    setLoader: PropTypes.func.isRequired,
    setOpen: PropTypes.func.isRequired,
    setPageNum: PropTypes.func.isRequired,
    siblings: PropTypes.instanceOf(Array)
};

RequestsTable.defaultProps = {
    oeActionControls: [],
    requests: [],
    siblings: []
};

export default RequestsTable;
