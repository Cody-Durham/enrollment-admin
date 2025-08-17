import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import ActionButton from "../components/formInputs/buttons/ActionButton.jsx";
import DcsdDialog from "../components/modals/DcsdDialog.jsx";
import EditOperationForm from "../components/formComponents/EditOperationForm.jsx";
import EditScoreForm from "../components/formComponents/EditScoreForm.jsx";
import EditStatusForm from "../components/formComponents/EditStatusForm.jsx";
import EnrollForm from "../components/formComponents/EnrollForm.jsx";
import FacetedSearch from "../components/formComponents/facetedSearch/FacetedSearch.jsx";
import Header from "../components/Header.jsx";
import LegendTable from "../components/tables/LegendTable.jsx";
import LoadingSvg from "../components/loadingSvg/LoadingSvg.jsx";
import OeOut from "../components/tables/OeOut.jsx";
import OpenEnrollmentDao from "../dao/OpenEnrollmentDao.jsx";
import RbA from "../components/rba/RbA.jsx";
import RequestsTable from "../components/tables/RequestsTable.jsx";
import Toolbar from "../components/Toolbar.jsx";

import { EVALUATION_SITE } from "../utils/auth/config.js";
import { getCompleteDateTime } from "../utils/DateFormatter.jsx";
import { GlobalContext } from "../components/contextProvider/ContextProvider.jsx";
import { stringGradeOrdinal } from "../const/UtilConsts.jsx";

import "../styles/Requests.scss";
import "../styles/Timeline.scss";

/**
 * @TODO: Faceted Search needs an approved method for altering params, facetField, and exclFieldList.
 * The current global vars do not update in real time, and including these in the get calls is wasteful.
 * Perhaps we can change these variables to useRef (as suggested by the linter) - WS 2024-10-03
 * Display the School Choice Management
 * @name Requests
 * @segment
 * @return {JSX.Element}
 */
const Requests = () => {
    const { dispatch, state } = useContext(GlobalContext);
    const { oeActiveDistrictWindow, token, userDetails } = state || {};

    const [availableSlots, setAvailableSlots] = useState(null);
    const [baseRequests, setBaseRequests] = useState(null);
    const [editOfferSuccess, setEditOfferSuccess] = useState(false);
    const [facetFields, setFacetFields] = useState(null);
    const [facetPagination, setFacetPagination] = useState(null);
    const [isFaceted, setIsFaceted] = useState(false);
    const [loader, setLoader] = useState(true);
    const [locationKey, setLocationKey] = useState(null);
    const [searchString, setSearchString] = useState("");
    const [oeActionControls, setOeActionControls] = useState(null);
    const [open, setOpen] = useState("false");
    const [operationData, setOperationData] = useState({});
    const [operationStatus, setOperationStatus] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [params, setParams] = useState({});
    const [requests, setRequests] = useState(null);
    const [scoringData, setScoringData] = useState([]);
    const [selectedFacets, setSelectedFacets] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showAvailableTable, setShowAvailableTable] = useState(false);
    const [siblings, setSiblings] = useState(null);
    const [statusData, setStatusData] = useState({});
    const [unableToEnroll, setUnableToEnroll] = useState(false);

    const allowedRolesArray = ["OPEN_ENROLLMENT_ADMIN", "PRINCIPAL", "REGISTRAR"];
    const navigate = useNavigate();
    // these values change, based on if user role is OPEN_ENROLLMENT_ADMIN or not
    let exclFieldList = "";
    let facetField =
        "educationalTrack,enrollmentRound,gradeApplying,kinderChoiceList,kinderOffer,languageChoiceList,languageOffer,macantaResident,schoolChoiceSchoolName,statusDisplayName";
    // these values do not change
    const facetLimit = 100;
    const numRows = 50;
    const sort = "schoolChoiceScore:desc,randomNumber:desc,completionDate:asc";

    /**
     * Set the selectedRequest and open the Edit Dialog
     * @name editRequest
     * @param {str} action
     * @param {str|null} opStatus
     * @param {{}} request
     */
    const editRequest = (action, request, status = null) => {
        setOperationStatus(status);
        setSelectedRequest(request);
        setOpen(action);
    };

    /**
     * Return the Action Buttons for the Edit Dialog
     * @name getEditActions
     * @return {Node}
     */
    const getEditStatusActions = () => {
        return (
            <>
                <ActionButton
                    className="action-button-cancel"
                    label="Cancel"
                    onClick={() => {
                        setOpen("false");
                        setOperationStatus(null);
                        setSelectedRequest(null);
                    }}
                />
                <ActionButton
                    className="action-button-reg"
                    disable={loader}
                    label="Submit"
                    onClick={() => {
                        handleStatusEdit();
                    }}
                />
            </>
        );
    };

    /**
     * Return the Action Buttons for the Enroll Dialog
     * @name getEnrollActions
     * @return {Node}
     */
    const getEnrollActions = () => {
        return (
            <>
                <ActionButton
                    className="action-button-cancel"
                    label="Cancel"
                    onClick={() => {
                        setOpen("false");
                        setEditOfferSuccess(false);
                        setSelectedRequest(null);
                        setUnableToEnroll(false);
                    }}
                />
                {!unableToEnroll && (
                    <ActionButton
                        className="action-button-reg"
                        disable={loader}
                        label="Submit"
                        onClick={() => {
                            handleEnroll();
                        }}
                    />
                )}
            </>
        );
    };

    /**
     * Return the Action Buttons for the Edit Dialog
     * @name getEditOperationActions
     * @return {Node}
     */
    const getEditOperationActions = () => {
        return (
            <>
                <ActionButton
                    className="action-button-cancel"
                    label="Cancel"
                    onClick={() => {
                        setOpen("false");
                        setSelectedRequest(null);
                    }}
                />
                <ActionButton
                    className="action-button-reg"
                    disable={loader}
                    label="Submit"
                    onClick={() => {
                        handleOperationsEdit();
                    }}
                />
            </>
        );
    };

    /**
     * Return the Action Buttons for the Edit Dialog
     * @name getEditActions
     * @return {Node}
     */
    const getEditScoreActions = () => {
        return (
            <>
                <ActionButton
                    className="action-button-cancel"
                    label="Cancel"
                    onClick={() => {
                        setOpen("false");
                        setSelectedRequest(null);
                    }}
                />
                <ActionButton
                    className="action-button-reg"
                    disable={loader}
                    label="Submit"
                    onClick={() => {
                        handleScoreSubmit();
                    }}
                />
            </>
        );
    };

    /**
     * Return to dashboard or profile
     * @name getBackToDialogActions
     * @return {node}
     */
    const getBackToDialogActions = () => {
        return (
            <>
                <ActionButton
                    className="action-button-cancel"
                    label="Cancel"
                    onClick={() => {
                        window.location.replace("/home");
                    }}
                />
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

    /**
     * Download a csv file of current search results
     * @name getOeRequestsExport
     */
    const getOeRequestsExport = () => {
        if (isOeAdmin()) {
            // alter facet fields to include IEP Status
            facetField =
                "educationalTrack,enrollmentRound,gradeApplying,kinderChoiceList,kinderOffer,languageChoiceList,languageOffer,macantaResident,schoolChoiceSchoolName,statusDisplayName,studentIepStatus,studentSchoolName";
        } else {
            const { userAttributeDto } = userDetails;
            const { userAttributeMap } = userAttributeDto;
            const { CURRENT_PREDOMINANT_SCHOOL } = userAttributeMap;
            // alter schoolChoiceLocationKey and schoolYearKey
            exclFieldList =
                "currentGrade,studentIepStatus,parentGuid,participatingSchoolId,schoolChoiceLocationKey,schoolChoiceSchoolName,studentLocationKey,studentFeederLocationKey,status,schoolYearKey,parentUsername,personId";
            params.schoolChoiceLocationKey = CURRENT_PREDOMINANT_SCHOOL.locationKey;
            params.schoolYearKey = oeActiveDistrictWindow.schoolYearKey;
            params["status(ne)"] = "CHOICE_CREATED,CHOICE_INCOMPLETE";
        }
        const paramRequests = {
            exclFieldList,
            facetField,
            facetLimit,
            numRows: 50000,
            pageNum: 0,
            searchString,
            sort
        };
        const requestParams = FacetedSearch.getRequestParams(params, paramRequests);
        const options = {
            action: "oeRequestsSearchableExport",
            params: requestParams,
            token
        };
        setLoader(true);
        // This is the Export statement to create the .CSV file
        OpenEnrollmentDao(options).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            // ---------------------  this is the name of the file ↓
            link.setAttribute("download", "OpenEnrollmentRequests.csv");
            document.body.appendChild(link);
            link.click();
            setLoader(false);
        });
    };

    /**
     * Sort the Facets Alphabetically
     * @name getSortedFields
     * @param {[]} fields
     * @returns
     */
    const getSortedFields = (fields) => {
        let fullySorted = fields;
        if (fields && fields.length > 0) {
            fields.sort((a, b) => {
                return a.fieldName > b.fieldName ? 1 : -1;
            });
            fullySorted = fields.reduce((results, obj) => {
                const { facetEntries, fieldName } = obj;
                if (["currentGrade", "gradeApplying"].includes(fieldName)) {
                    facetEntries.sort((a, b) => {
                        return stringGradeOrdinal[a.value] > stringGradeOrdinal[b.value] ? 1 : -1;
                    });
                } else {
                    facetEntries.sort((a, b) => {
                        return a.value > b.value ? 1 : -1;
                    });
                }
                results.push(obj);

                return results;
            }, []);
        }

        return fullySorted;
    };

    /**
     * Act like a psuedo-page-refresh - force a table redraw with updated results
     * @name getRefresh
     */
    const getRefresh = (dismiss = true) => {
        setTimeout(() => {
            toast.dismiss();
            setBaseRequests(null);
            if (dismiss) {
                setOpen("false");
                setSelectedRequest(null);
                setUnableToEnroll(false);
                setEditOfferSuccess(false);
            }
            getOeRequests();
            setLoader(false);
        }, 3000);
    };

    const handleScoreSubmit = () => {
        setLoader(true);
        const options = {
            action: "oeSchoolChoiceScoresPost",
            data: scoringData,
            schoolChoiceKey: selectedRequest.key,
            token
        };
        OpenEnrollmentDao(options).then((response) => {
            if (response) {
                toast.success("Successfully updated School Choice Score", { autoClose: 3000 });
                getRefresh();
            } else {
                toast.error("There was a problem updating the School Choice Score", { autoClose: false });
                setLoader(false);
            }
        });
    };

    const validateOperation = () => {
        if (operationData.status === "MAKE_OFFER_PENDING") {
            if (selectedRequest.gradeApplying === "K") {
                if (operationData.kinderOffer === "") {
                    toast.error("All fields are required. Please enter a Kinder Offer and try again.", {
                        autoClose: false
                    });

                    return false;
                }
            }
            if (selectedRequest.languageChoice !== null) {
                if (operationData.languageOffer === "") {
                    toast.error("All fields are required. Please enter a Language Offer and try again.", {
                        autoClose: false
                    });

                    return false;
                }
            }
        } else if (operationData.status === "") {
            toast.error("All fields are required. Please enter a Status and try again.", {
                autoClose: false
            });

            return false;
        } else {
            if (selectedRequest.gradeApplying === "K") {
                if (operationData.kinderOffer === "") {
                    toast.error("All fields are required. Please enter a Kinder Offer and try again.", {
                        autoClose: false
                    });

                    return false;
                }
            }
            if (selectedRequest.languageChoice !== null) {
                if (operationData.languageOffer === "") {
                    toast.error("All fields are required. Please enter a Language Offer and try again.", {
                        autoClose: false
                    });

                    return false;
                }
            }
        }

        return true;
    };

    /**
     * Submit the operations edits
     * @name handleOperationsEdit
     */
    const handleOperationsEdit = async (enrolling = false) => {
        if (!validateOperation()) {
            return false;
        }
        toast.dismiss();
        const { kinderOffer, languageOffer, status } = operationData;
        const {
            completionDate,
            createdDate,
            key,
            kinderChoice,
            languageChoice,
            lastUpdateDate,
            notes,
            participatingSchoolId,
            randomNumber,
            schoolChoiceScore,
            student
        } = selectedRequest;
        const data = {
            createdDate: getCompleteDateTime(createdDate),
            completionDate: getCompleteDateTime(completionDate),
            key,
            kinderChoice,
            kinderOffer: kinderOffer === "" ? null : kinderOffer,
            languageChoice,
            languageOffer: languageOffer === "" ? null : languageOffer,
            lastUpdateDate: getCompleteDateTime(lastUpdateDate),
            notes: notes ? notes.trim() : "",
            participatingSchoolId,
            randomNumber,
            score: schoolChoiceScore,
            status,
            student
        };
        const options = {
            action: "oeRequestUpdate",
            data,
            key,
            token
        };
        setLoader(true);
        OpenEnrollmentDao(options).then((response) => {
            if (response) {
                const { errors, payload } = response.data;
                if (payload && requests) {
                    toast.success("Successfully updated the open enrollment request", { autoClose: false });
                    if (enrolling) {
                        return true;
                    }
                    getRefresh();
                } else if (errors && errors.length) {
                    let errorMessage = "Unable to update open enrollment request.";
                    errorMessage = `${errorMessage}:\n${errors.join("\n")}`;
                    toast.error(`${errorMessage}`, {
                        autoClose: false,
                        closeOnClick: true,
                        style: { width: "100%", whiteSpace: "break-spaces" }
                    });
                }
            } else {
                toast.error("There was a problem updating the open enrollment request.");
            }
            if (!enrolling) {
                setTimeout(() => {
                    setLoader(false);
                    setSelectedRequest(null);
                    setOpen("false");
                }, 3000);
            }
        });

        return true;
    };

    /**
     * OE Admin direct update of request status
     * @name handleStatusEdit
     */
    const handleStatusEdit = () => {
        const options = {
            action: "oeRequestStatusUpdate",
            newStatus: statusData.status,
            oldStatus: selectedRequest.status,
            params: {
                schoolChoiceId: selectedRequest.key,
                userGuid: userDetails.uid
            },
            token
        };
        setLoader(true);
        OpenEnrollmentDao(options).then((response) => {
            if (response) {
                const { errors } = response.data;
                if (errors && errors.length) {
                    let errorMessage = "Unable to update open enrollment request.";
                    errorMessage = `${errorMessage}:\n${errors.join("\n")}`;
                    toast.error(`${errorMessage}`, {
                        autoClose: false,
                        closeOnClick: true,
                        style: { width: "100%", whiteSpace: "break-spaces" }
                    });
                    setLoader(false);
                } else {
                    toast.success("Successfully updated the open enrollment request status", { autoClose: false });
                    getRefresh();
                }
            }
        });
    };

    /**
     * Enroll student
     * @name handleEnroll
     */
    const handleEnroll = () => {
        const enrollOptions = {
            action: "oeEnroll",
            schoolChoiceKey: selectedRequest.key,
            token
        };
        let changeFlag = false;
        // validate that there are offer values, if applicable. also, if offers are relevant and have changed, update the schoolChoice first
        if (selectedRequest.gradeApplying === "K") {
            if (operationData.kinderOffer === "") {
                toast.error("All fields are required. Please enter a Kinder Offer and try again.", {
                    autoClose: false
                });

                return false;
            } else if (operationData.kinderOffer !== selectedRequest.kinderOffer) {
                changeFlag = true;
            }
        }
        if (selectedRequest.languageChoice !== null) {
            if (operationData.languageOffer === "") {
                toast.error("All fields are required. Please enter a Language Offer and try again.", {
                    autoClose: false
                });

                return false;
            } else if (operationData.languageOffer !== selectedRequest.languageOffer) {
                changeFlag = true;
            }
        }
        if (changeFlag) {
            toast.dismiss();
            const { kinderOffer, languageOffer, status } = operationData;
            const {
                completionDate,
                createdDate,
                key,
                kinderChoice,
                languageChoice,
                lastUpdateDate,
                notes,
                participatingSchoolId,
                randomNumber,
                schoolChoiceScore,
                student
            } = selectedRequest;
            const data = {
                createdDate: getCompleteDateTime(createdDate),
                completionDate: getCompleteDateTime(completionDate),
                key,
                kinderChoice,
                kinderOffer: kinderOffer === "" ? null : kinderOffer,
                languageChoice,
                languageOffer: languageOffer === "" ? null : languageOffer,
                lastUpdateDate: getCompleteDateTime(lastUpdateDate),
                notes: notes ? notes.trim() : "",
                participatingSchoolId,
                randomNumber,
                score: schoolChoiceScore,
                status,
                student
            };
            const updateOptions = {
                action: "oeRequestUpdate",
                data,
                key,
                token
            };
            setLoader(true);
            OpenEnrollmentDao(updateOptions).then((uResponse) => {
                if (uResponse) {
                    if (uResponse.data.payload) {
                        setEditOfferSuccess(true);
                        getRefresh(false);
                        OpenEnrollmentDao(enrollOptions).then((eResponse) => {
                            if (eResponse) {
                                const { errors, payload } = eResponse.data;
                                if (payload) {
                                    toast.success("Successfully updated the open enrollment request.", {
                                        autoClose: 4000
                                    });
                                    toast.success("Guardian user account successfully created in Infinite Campus.", {
                                        autoClose: 4000
                                    });
                                    setUnableToEnroll(false);
                                    getRefresh();
                                } else if (errors && errors.length > 0) {
                                    let errorMessage = "Unable to process open enrollment request.";
                                    errorMessage = `${errorMessage}:\n${errors.join("\n")}`;
                                    toast.error(`${errorMessage}`, {
                                        autoClose: false,
                                        closeOnClick: true,
                                        style: { width: "100%", whiteSpace: "break-spaces" }
                                    });
                                    setUnableToEnroll(true);
                                }
                            } else {
                                setUnableToEnroll(true);
                            }
                        });
                    } else if (uResponse.data.errors && uResponse.data.errors.length > 0) {
                        let errorMessage = "Unable to update open enrollment request.";
                        errorMessage = `${errorMessage}:\n${uResponse.data.errors.join("\n")}`;
                        toast.error(`${errorMessage}`, {
                            autoClose: false,
                            closeOnClick: true,
                            style: { width: "100%", whiteSpace: "break-spaces" }
                        });
                        setUnableToEnroll(true);
                        setEditOfferSuccess(false);
                    }
                }
                setLoader(false);
            });
        } else {
            setLoader(true);
            OpenEnrollmentDao(enrollOptions).then((response) => {
                if (response) {
                    const { errors, payload } = response.data;
                    if (payload) {
                        toast.success("Guardian user account successfully created in Infinite Campus.", {
                            autoClose: 3000
                        });
                        setUnableToEnroll(false);
                        getRefresh();
                    } else if (errors && errors.length > 0) {
                        let errorMessage = "Unable to update open enrollment request.";
                        errorMessage = `${errorMessage}:\n${errors.join("\n")}`;
                        toast.error(`${errorMessage}`, {
                            autoClose: false,
                            closeOnClick: true,
                            style: { width: "100%", whiteSpace: "break-spaces" }
                        });
                        setUnableToEnroll(true);
                    }
                } else {
                    setUnableToEnroll(true);
                }
                setLoader(false);
            });
        }
    };

    /**
     * Is the user an Open Enrollment Admin
     * @name isOeAdmin
     * @return {bool}
     */
    const isOeAdmin = useCallback(() => {
        const { roleDtos } = userDetails;
        const adminObj = roleDtos.find((obj) => obj.role.toUpperCase() === "OPEN_ENROLLMENT_ADMIN") || null;

        return adminObj ? true : false;
    }, [userDetails]);

    /**
     * Query the Open Enrollment Requests searchable service
     * @name getOeRequests
     * @callback
     * @type {(function(): void)|*}
     */
    const getOeRequests = useCallback(() => {
        setBaseRequests(null);
        if (isOeAdmin()) {
            /* eslint-disable */
            // alter facet fields to include IEP Status
            facetField =
                "educationalTrack,enrollmentRound,gradeApplying,kinderChoiceList,kinderOffer,languageChoiceList,languageOffer,macantaResident,schoolChoiceSchoolName,statusDisplayName,studentIepStatus";
            /* eslint-enable */
        } else {
            const { userAttributeDto } = userDetails;
            const { userAttributeMap } = userAttributeDto;
            const { CURRENT_PREDOMINANT_SCHOOL } = userAttributeMap;
            /* eslint-disable */
            // alter schoolChoiceLocationKey and schoolYearKey
            exclFieldList =
                "currentGrade,studentIepStatus,parentGuid,participatingSchoolId,schoolChoiceLocationKey,schoolChoiceSchoolName,studentLocationKey,studentFeederLocationKey,status,schoolYearKey,parentUsername,personId";
            /* eslint-enable */
            params.schoolChoiceLocationKey = CURRENT_PREDOMINANT_SCHOOL.locationKey;
            params.schoolYearKey = oeActiveDistrictWindow.schoolYearKey;
            params["status(ne)"] = "CHOICE_CREATED,CHOICE_INCOMPLETE";
            setLocationKey(CURRENT_PREDOMINANT_SCHOOL.locationKey);
        }
        const paramRequests = {
            facetField,
            facetLimit,
            numRows,
            pageNum,
            searchString,
            sort
        };
        // if a grade-specific facet is chosen we don't want to show siblings grouped together
        if (params?.gradeApplying || params?.kinderChoiceList || params?.kinderOffer) {
            setIsFaceted(true);
        } else {
            setIsFaceted(false);
        }
        const requestParams = FacetedSearch.getRequestParams(params, paramRequests);
        const options = {
            action: "oeRequestsSearchableRead",
            params: requestParams,
            token
        };
        setLoader(true);
        OpenEnrollmentDao(options).then((response) => {
            if (response) {
                const { payload } = response.data;
                if (payload) {
                    setBaseRequests(payload.results);
                    const sorted = getSortedFields(payload.facetFields);
                    setFacetFields(sorted);
                    setFacetPagination(payload.facetPaginationInfoDto);
                }
            }
            setTimeout(() => {
                setLoader(false);
            }, 1000);
        });
    }, [exclFieldList, facetField, isOeAdmin, oeActiveDistrictWindow, pageNum, params, searchString, token]);

    /**
     * Get any and all siblings per request that are open-enrolling to the same school
     * @async embedded function
     * If there is a grade-specific facet in place, only group the siblings applying to the same grade
     * @TODO - IMPORTANT. In order to improve efficiency, we should gather a list of unique Parent Usernames and only
     * call those once. Also, we could store these results per parentUsername in context, so that we don't have to call
     * those more than once.
     */
    useEffect(() => {
        const fetchWithSiblings = async () => {
            if (baseRequests && token) {
                const sibKeys = [];
                const withSiblings = await Promise.all(
                    baseRequests.map(async (request) => {
                        if (request && !["", null, "Parent username not found."].includes(request.parentUsername)) {
                            const requestParams = {
                                facetField: "",
                                facetLimit,
                                numRows,
                                pageNum: 0,
                                parentUsername: request.parentUsername,
                                searchString: "",
                                sort,
                                "status(ne)": "CANCELLED_REQUEST,CHOICE_CREATED,CHOICE_INCOMPLETE"
                            };
                            const options = {
                                action: "oeRequestsSearchableRead",
                                params: requestParams,
                                token
                            };

                            try {
                                const response = await OpenEnrollmentDao(options);
                                if (response) {
                                    const { payload } = response.data;
                                    const { results } = payload;

                                    if (results && results.length > 0) {
                                        const allSiblings = results.filter(
                                            (sibling) =>
                                                parseInt(sibling.student, 10) !== parseInt(request.student, 10) &&
                                                parseInt(sibling.participatingSchoolId, 10) ===
                                                    parseInt(request.participatingSchoolId, 10)
                                        );
                                        if (isFaceted) {
                                            if (allSiblings && allSiblings.length > 0) {
                                                const sibMatch = allSiblings.filter(
                                                    (sibling) => sibling.gradeApplying === request.gradeApplying
                                                );
                                                sibKeys.push(request.key);
                                                if (sibMatch && sibMatch.length > 0) {
                                                    const combined = [request, ...sibMatch];
                                                    const sortedCombined = [...combined].sort((a, b) => {
                                                        // if schoolChoiceScore is null convert to 0
                                                        const b_nanCheck = parseInt(b.schoolChoiceScore, 10) || 0;
                                                        const a_nanCheck = parseInt(a.schoolChoiceScore, 10) || 0;
                                                        // asc order
                                                        return b_nanCheck - a_nanCheck;
                                                    });

                                                    return sortedCombined;
                                                }
                                            }

                                            return [request];
                                        } else {
                                            const combined = [request, ...allSiblings];
                                            const sortedCombined = [...combined].sort((a, b) => {
                                                // if schoolChoiceScore is null convert to 0
                                                const b_nanCheck = parseInt(b.schoolChoiceScore, 10) || 0;
                                                const a_nanCheck = parseInt(a.schoolChoiceScore, 10) || 0;
                                                // desc order - larger number listed first
                                                return b_nanCheck - a_nanCheck;
                                            });

                                            return sortedCombined;
                                        }
                                    }
                                }
                            } catch (error) {
                                // good for debugging
                                /* eslint-disable-next-line no-console */
                                console.error("Error fetching sibling data:", error);
                            }
                        }

                        // If no siblings or invalid request, return only the student
                        return [request];
                    })
                );

                // Before we flatten the results, find all sibling arrays (length > 1) and record the request key
                withSiblings.map((studentArr) => {
                    if (studentArr && studentArr.length > 1) {
                        studentArr.forEach((obj) => {
                            sibKeys.push(obj.key);
                        });
                    }
                });
                setSiblings(sibKeys);
                // Flatten the array and deduplicate
                const flattenedResults = Array.from(
                    new Map(
                        withSiblings
                            .flat() // Flatten the nested arrays
                            .map((item) => [item.key, item]) // Map by unique key
                    ).values()
                );

                setRequests(flattenedResults);
            }
        };

        fetchWithSiblings();
    }, [baseRequests, isFaceted, token]);

    /**
     * Retrieve Open Enrolled Requests if the user has a predominant location
     */
    useEffect(() => {
        if (oeActiveDistrictWindow && token && userDetails) {
            const { userAttributeDto } = userDetails;
            const { userAttributeMap } = userAttributeDto;
            const { CURRENT_PREDOMINANT_SCHOOL } = userAttributeMap;
            if (CURRENT_PREDOMINANT_SCHOOL) {
                getOeRequests();
            } else {
                setOpen("no-predominate-location");
            }
        }
    }, [getOeRequests, isOeAdmin, oeActiveDistrictWindow, token, userDetails]);

    /**
     * Get the schoolYearKey and dispatch to state (contextProvider)
     * this call is from OE current district window
     */
    useEffect(() => {
        if (token && !oeActiveDistrictWindow) {
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
                }
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
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
                        setOeActionControls(payload);
                    }
                }
            });
        }
    }, [token, oeActionControls, oeActiveDistrictWindow]);

    /**
     * Non-OE_ADMINS are not allowed access here unless the action window is appropriate
     */
    useEffect(() => {
        if (oeActionControls) {
            let actionControlMatch = [];
            actionControlMatch = oeActionControls.filter((obj) =>
                ["SCHOOL_FINALIZE", "SCHOOL_OFFER_PENDING", "SCHOOL_VIEW_PARENT_OFFER", "SCHOOL_VIEW_ONLY"].includes(
                    obj.action
                )
            );
            if (!isOeAdmin() && actionControlMatch?.length < 1) {
                navigate("/home");
            }
        }
    }, [isOeAdmin, navigate, oeActionControls]);

    /**
     * Are we looking at requests for a single school? If so, we will display the available slots table
     */
    useEffect(() => {
        if (baseRequests && baseRequests.length > 0) {
            if (isOeAdmin()) {
                const uniqueSchoolKeys = [...new Set(baseRequests.map((obj) => obj.schoolChoiceLocationKey))];
                if (uniqueSchoolKeys && uniqueSchoolKeys.length === 1) {
                    setLocationKey(uniqueSchoolKeys[0]);
                } else {
                    setLocationKey(null);
                }
            }
        }
    }, [isOeAdmin, baseRequests]);

    return (
        <RbA allowedRoles={allowedRolesArray} redirect="/notFound">
            <Header />
            <ToastContainer style={{ width: "50%" }} />
            <div className="gutter-95">
                <Toolbar label="Manage OE Requests" showBackButton />
                {facetFields && (
                    <FacetedSearch
                        exportCsvHandler={getOeRequestsExport}
                        facetFields={facetFields}
                        includeKeyword
                        params={params}
                        selectedFacets={selectedFacets}
                        setPageNum={setPageNum}
                        setParams={setParams}
                        setSearchString={setSearchString}
                        setSelectedFacets={setSelectedFacets}
                    />
                )}
                {locationKey && requests?.length > 0 && (
                    <div
                        className="mt-4"
                        style={{ borderRadius: "10px", border: "3px solid #febf31", padding: "20px" }}
                    >
                        {showAvailableTable ? (
                            <button
                                aria-label="hide available slots table"
                                className="btn btn-transparent"
                                name="hideTable"
                                onClick={() => {
                                    setShowAvailableTable(false);
                                }}
                                type="button"
                            >
                                <i className="bi bi-caret-up-fill" style={{ color: "#097969", fontSize: "1.2rem" }} />{" "}
                                <span style={{ fontWeight: "600", fontStyle: "italic" }}>
                                    Collapse school available slots (by grade) and count of current students (by grade)
                                    who are applying to another school during Open Enrollment
                                </span>
                            </button>
                        ) : (
                            <button
                                aria-label="show available slots table"
                                className="btn btn-transparent"
                                name="showTable"
                                onClick={() => {
                                    setShowAvailableTable(true);
                                }}
                                type="button"
                            >
                                <i className="bi bi-caret-down-fill" style={{ color: "#097969", fontSize: "1.2rem" }} />{" "}
                                <span style={{ fontWeight: "600", fontStyle: "italic" }}>
                                    Expand to view school available slots (by grade) and count of current students (by
                                    grade) who are applying to another school during Open Enrollment
                                </span>
                            </button>
                        )}
                        {showAvailableTable && (
                            <OeOut
                                availableSlots={availableSlots}
                                locationKey={locationKey}
                                setAvailableSlots={setAvailableSlots}
                            />
                        )}
                    </div>
                )}
                <div className="no-data-message">
                    <h4 className="no-data-message-heading">
                        The following is a list of Open Enrollment School Choice requests for the current school year.
                    </h4>
                    <br />
                    Results, which are limited to <strong>{numRows} per page</strong>, can be searched by keyword or by
                    using the search filters displayed. You can click on the edit pencil to make adjustments to{" "}
                    <strong>Kinder Offer</strong>, <strong>Language Offer</strong>, <strong>Score</strong>,{" "}
                    <strong>Status</strong> and <strong>Notes</strong>.
                </div>
                {requests && (
                    <>
                        <div className="requests-table">
                            {facetPagination && (
                                <RequestsTable
                                    editRequest={editRequest}
                                    facetPagination={facetPagination}
                                    isOeAdmin={isOeAdmin}
                                    oeActionControls={oeActionControls}
                                    requests={requests}
                                    setOpen={setOpen}
                                    setPageNum={setPageNum}
                                    setLoader={setLoader}
                                    siblings={siblings}
                                />
                            )}
                        </div>
                        <LegendTable isOeAdmin={isOeAdmin} />
                        <DcsdDialog
                            actions={getEditStatusActions()}
                            ariaLabel="Edit Open Enrollment Request Status"
                            backdrop="staticBackdrop"
                            hasCloseX
                            id="edit-status"
                            onHide={() => {
                                setEditOfferSuccess(false);
                                setOpen("false");
                                setOperationStatus(null);
                                setSelectedRequest(null);
                                setUnableToEnroll(false);
                            }}
                            open={open}
                            title="Edit Open Enrollment Request Status"
                        >
                            {selectedRequest && (
                                <>
                                    <p>
                                        Use this form to edit the School Choice Status for{" "}
                                        <span style={{ fontWeight: "bold" }}>
                                            {selectedRequest?.firstName} {selectedRequest?.lastName}
                                        </span>
                                        .
                                    </p>
                                    <EditStatusForm
                                        loader={loader}
                                        operationStatus={operationStatus}
                                        selectedRequest={selectedRequest}
                                        setLoader={setLoader}
                                        setStatusData={setStatusData}
                                    />
                                </>
                            )}
                            {loader && (
                                <div className="dialog-loader">
                                    Processing... Please Wait <LoadingSvg />
                                </div>
                            )}
                        </DcsdDialog>
                        <DcsdDialog
                            actions={getEditOperationActions()}
                            ariaLabel="Edit Open Enrollment Request"
                            backdrop="staticBackdrop"
                            hasCloseX
                            id="edit-operation"
                            onHide={() => {
                                setOpen("false");
                                setSelectedRequest(null);
                                setUnableToEnroll(false);
                                setEditOfferSuccess(false);
                            }}
                            open={open}
                            title="Edit Open Enrollment Request"
                        >
                            {selectedRequest && (
                                <>
                                    <p>
                                        Use this form to edit the School Choice Status for{" "}
                                        <span style={{ fontWeight: "bold" }}>
                                            {selectedRequest?.firstName} {selectedRequest?.lastName}
                                        </span>
                                        .
                                    </p>
                                    <EditOperationForm
                                        isOeAdmin={isOeAdmin}
                                        loader={loader}
                                        selectedRequest={selectedRequest}
                                        setOperationData={setOperationData}
                                    />
                                </>
                            )}
                            {loader && (
                                <div className="dialog-loader">
                                    Processing... Please Wait <LoadingSvg />
                                </div>
                            )}
                        </DcsdDialog>
                        <DcsdDialog
                            actions={getEditScoreActions()}
                            ariaLabel="Edit Open Enrollment Request"
                            backdrop="staticBackdrop"
                            hasCloseX
                            id="edit-score"
                            onHide={() => {
                                setOpen("false");
                                setSelectedRequest(null);
                                setUnableToEnroll(false);
                                setEditOfferSuccess(false);
                            }}
                            open={open}
                            title="Edit Open Enrollment Request"
                        >
                            {selectedRequest && token && (
                                <>
                                    <p>
                                        Use this form to edit Custom Scoring for{" "}
                                        <span style={{ fontWeight: "bold" }}>
                                            {selectedRequest?.firstName} {selectedRequest?.lastName}
                                        </span>
                                        .
                                    </p>
                                    <EditScoreForm
                                        loader={loader}
                                        selectedRequest={selectedRequest}
                                        setLoader={setLoader}
                                        setScoringData={setScoringData}
                                    />
                                </>
                            )}
                        </DcsdDialog>
                        <DcsdDialog
                            actions={getEnrollActions()}
                            ariaLabel="Edit Open Enrollment Request"
                            backdrop="staticBackdrop"
                            hasCloseX
                            id="enroll"
                            onHide={() => {
                                setEditOfferSuccess(false);
                                setOpen("false");
                                setSelectedRequest(null);
                                setUnableToEnroll(false);
                            }}
                            open={open}
                            title="Edit Open Enrollment Request"
                        >
                            {selectedRequest && token && (
                                <EnrollForm
                                    loader={loader}
                                    selectedRequest={selectedRequest}
                                    editOfferSuccess={editOfferSuccess}
                                    setOperationData={setOperationData}
                                    unableToEnroll={unableToEnroll}
                                />
                            )}
                        </DcsdDialog>
                    </>
                )}
                <DcsdDialog
                    actions={getBackToDialogActions()}
                    ariaLabel="Must have primary school location dialog"
                    hasCloseX={false}
                    id="no-predominate-location"
                    onHide={() => {
                        setOpen("false");
                        setUnableToEnroll(false);
                        setEditOfferSuccess(false);
                    }}
                    open={open}
                    title="Your Predominant Location is not set"
                >
                    <div>Please set your Predominant School Location to view the Open Enrollment Manager. </div>
                </DcsdDialog>
            </div>
            {loader && <LoadingSvg />}
        </RbA>
    );
};

export default Requests;
