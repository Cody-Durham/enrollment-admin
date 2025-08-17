import React, { useCallback, useContext, useEffect, useReducer, useState } from "react";
import Header from "../components/Header.jsx";
import { toast, ToastContainer } from "react-toastify";
import FormReducer from "../utils/FormReducer.jsx";
import { GlobalContext } from "../components/contextProvider/ContextProvider.jsx";
import RbA from "../components/rba/RbA.jsx";
import ActionButton from "../components/formInputs/buttons/ActionButton.jsx";
import EditStudentForm from "../components/formComponents/EditStudentForm.jsx";
import DcsdDialog from "../components/modals/DcsdDialog.jsx";
import FacetedSearch from "../components/formComponents/facetedSearch/FacetedSearch.jsx";
import { formatDbDate } from "../utils/DateFormatter.jsx";
import LoadingSvg from "../components/loadingSvg/LoadingSvg.jsx";
import OpenEnrollmentDao from "../dao/OpenEnrollmentDao.jsx";
import { stringGradeOrdinal } from "../const/UtilConsts.jsx";
import Toolbar from "../components/Toolbar.jsx";
import StudentsTable from "../components/tables/StudentsTable.jsx";

import "../styles/Students.scss";

/**
 * Display a table of OE Students
 * @name Students
 * @constructor
 * @return {JSX.Element}
 */
const Students = () => {
    const { state } = useContext(GlobalContext);
    const { token } = state || {};

    const initialFormState = {
        currentGrade: "",
        firstName: "",
        gradeApplying: "",
        lastName: "",
        overrideStatus: ""
    };

    const [formState, formDispatch] = useReducer(FormReducer, initialFormState);

    const [facetFields, setFacetFields] = useState(null);
    const [facetPagination, setFacetPagination] = useState(null);
    const [loader, setLoader] = useState(true);
    const [searchString, setSearchString] = useState("");
    const [open, setOpen] = useState("false");
    const [pageNum, setPageNum] = useState(1);
    const [params, setParams] = useState({});
    const [selectedFacets, setSelectedFacets] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [students, setStudents] = useState(null);

    const allowedRolesArray = ["OPEN_ENROLLMENT_ADMIN"];
    // these values will not change
    const facetField = "currentGrade,currentSchoolName,gradeApplying,overrideStatus";
    const facetLimit = 100;
    const numRows = 50;
    const sort = "lastName:asc,firstName:asc,currentSchoolName:asc,feederLocationName:asc";

    /**
     * Set the selectedStudent and open the Edit Dialog
     * @name editStudent
     * @param {{}} student
     */
    const editStudent = (student) => {
        setSelectedStudent(student);
        setOpen("edit");
    };

    /**
     * Return the Action Buttons for the Edit Dialog
     * @name getEditActions
     * @return {Node}
     */
    const getEditActions = () => {
        return (
            <>
                <ActionButton
                    className="action-button-cancel"
                    label="Cancel"
                    onClick={() => {
                        setOpen("false");
                        setSelectedStudent(null);
                        setShowConfirm(false);
                    }}
                />
                <ActionButton
                    className="action-button-reg"
                    disable={loader}
                    label="Submit"
                    onClick={() => {
                        handleEdit();
                    }}
                />
            </>
        );
    };

    /**
     * Download a csv file of current search results
     * @name getOeStudentExport
     */
    const getOeStudentExport = () => {
        const exclFieldList = "";
        const requests = {
            exclFieldList,
            facetField,
            facetLimit,
            numRows: 50000,
            pageNum: 0,
            searchString,
            sort
        };
        const requestParams = FacetedSearch.getRequestParams(params, requests);
        const options = {
            action: "oeStudentsSearchableExport",
            params: requestParams,
            token
        };
        setLoader(true);
        // This is the Export statement to create the .CSV file
        OpenEnrollmentDao(options).then((response) => {
            if (response) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                // ---------------------  this is the name of the file ↓
                link.setAttribute("download", "OpenEnrollmentStudents.csv");
                document.body.appendChild(link);
                link.click();
            } else {
                toast.info("There was a problem exporting results, or there are no results to export.");
            }
            setLoader(false);
        });
    };

    /**
     * Act like a psuedo-page-refresh - force a table redraw with updated results
     * @name getRefresh
     */
    const getRefresh = () => {
        getOeStudents();
        setLoader(false);
        setOpen("false");
        setSelectedStudent(null);
        setShowConfirm(false);
        toast.dismiss();
    };

    /**
     * Sort facet fields alphabetically
     * @name getSortedFields
     * @param {[]} fields
     * @return {[]} fullySorted
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
     * Submit the student edits
     * @name handleEdit
     */
    const handleEdit = () => {
        const { currentGrade, firstName, gradeApplying, lastName, overrideStatus } = structuredClone(formState);
        if (
            currentGrade === "" ||
            firstName === "" ||
            gradeApplying === "" ||
            lastName === "" ||
            overrideStatus === ""
        ) {
            toast.error("All fields are required. Please enter values that are missing and try again.", {
                autoClose: false
            });
            return false;
        }
        toast.dismiss();
        const {
            addressLine1,
            addressLine2,
            displayBirthdate,
            city,
            feederLocationKey,
            gender,
            gridCode,
            key,
            locationKey,
            middleName,
            oodSchoolCity,
            oodSchoolName,
            oodSchoolState,
            parentGuid,
            personId,
            schoolYearKey,
            state,
            studentNumber,
            zip
        } = structuredClone(selectedStudent);
        if (
            (currentGrade !== selectedStudent?.currentGrade || gradeApplying !== selectedStudent?.gradeApplying) &&
            !showConfirm
        ) {
            setShowConfirm(true);
            return true;
        }
        const data = {
            address: {
                addressLine1,
                addressLine2,
                city,
                state,
                zip
            },
            birthdate: formatDbDate(displayBirthdate),
            feederLocationKey,
            firstName: firstName.trim(),
            gradeApplying,
            gradeName: currentGrade,
            gender,
            gridCode,
            key,
            lastName: lastName.trim(),
            locationKey,
            middleName,
            oodSchoolName,
            oodSchoolCity,
            oodSchoolState,
            overrideStatus:
                overrideStatus === "ALLOW_CURRENT_AND_FEEDER_LOCATIONS" ? "ALLOW_CURRENT_FEEDER" : overrideStatus,
            personId,
            parentGuid,
            schoolYearKey,
            studentNumber
        };
        const options = {
            action: "oeStudentUpdate",
            data,
            key,
            token
        };
        setLoader(true);
        OpenEnrollmentDao(options).then((response) => {
            if (response) {
                const { errors, payload } = response.data;
                if (payload && students) {
                    toast.success("Successfully updated the open enrollment student", { autoClose: false });
                    setTimeout(() => {
                        getRefresh();
                    }, 3000);
                } else if (errors && errors.length) {
                    let errorMessage = "Unable to update open enrollment student.";
                    errorMessage = `${errorMessage}:\n${errors.join("\n")}`;
                    toast.error(`${errorMessage}`, {
                        autoClose: false,
                        closeOnClick: true,
                        style: { width: "100%", whiteSpace: "break-spaces" }
                    });
                }
            } else {
                toast.error("There was a problem updating the open enrollment student.");
            }
            setTimeout(() => {
                setLoader(false);
                setOpen("false");
                setSelectedStudent(null);
                setShowConfirm(false);
            }, 3000);
        });

        return true;
    };

    /**
     * Query the Open Enrollment Students searchable service
     * @name getOeStudents
     * @callback
     * @type {(function(): void)|*}
     */
    const getOeStudents = useCallback(() => {
        const requests = {
            facetField,
            facetLimit,
            numRows,
            pageNum,
            searchString,
            sort
        };
        const requestParams = FacetedSearch.getRequestParams(params, requests);
        const options = {
            action: "oeStudentsSearchableRead",
            params: requestParams,
            token
        };
        setLoader(true);
        // sets the payload
        OpenEnrollmentDao(options).then((response) => {
            if (response) {
                const { payload } = response.data;
                if (payload) {
                    setStudents(payload.results);
                    const sorted = getSortedFields(payload.facetFields);
                    setFacetFields(sorted);
                    setFacetPagination(payload.facetPaginationInfoDto);
                }
            }
            setLoader(false);
        });
    }, [pageNum, params, searchString, token]);

    /**
     * Translate an override_status from English words to ENUM
     * @name overrideTrans
     * @param {string} status
     * @returns
     */
    const overrideTrans = (status) => {
        return status.split(" ").join("_").toUpperCase();
    };

    /**
     * Retrieve Open Enrolled Students
     */
    useEffect(() => {
        if (token) {
            getOeStudents();
        }
    }, [getOeStudents, token]);

    /**
     * Update formState when a new student is selected
     */
    useEffect(() => {
        if (selectedStudent) {
            const tmpFormState = structuredClone(formState);
            tmpFormState.currentGrade = selectedStudent.currentGrade || "";
            tmpFormState.firstName = selectedStudent.firstName || "";
            tmpFormState.gradeApplying = selectedStudent.gradeApplying || "";
            tmpFormState.lastName = selectedStudent.lastName || "";
            tmpFormState.overrideStatus = overrideTrans(selectedStudent.overrideStatus) || "Default Location Check";
            formDispatch({
                type: "reset",
                payload: { ...tmpFormState }
            });
        }
        /* eslint-disable-next-line */
    }, [selectedStudent]);

    return (
        <RbA allowedRoles={allowedRolesArray} redirect="/notFound">
            <Header />
            <ToastContainer style={{ width: "50%" }} />
            <div className="gutter-95">
                <Toolbar label="Manage OE Students" showBackButton />
                {facetFields && (
                    <FacetedSearch
                        exportCsvHandler={getOeStudentExport}
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
                <div className="no-data-message">
                    <h4 className="no-data-message-heading">
                        The following is a list of Open Enrollment students for the current school year.
                    </h4>
                    <br />
                    Results, which are limited to <strong>{numRows} per page</strong>, can be searched by keyword or by
                    using the search filters displayed. For new students (
                    <em>
                        <u>do not presently attend a DCSD school</u>
                    </em>
                    ), you can click on the edit pencil to make adjustments to student name, current grade, applying to
                    grade and location check.
                </div>
                {students && (
                    <>
                        <StudentsTable
                            editStudent={editStudent}
                            facetPagination={facetPagination}
                            setPageNum={setPageNum}
                            students={students}
                        />
                        <DcsdDialog
                            actions={getEditActions()}
                            ariaLabel="Edit Open Enrollment Student"
                            backdrop="staticBackdrop"
                            hasCloseX
                            id="edit"
                            onHide={() => {
                                setOpen("false");
                                setSelectedStudent(null);
                            }}
                            open={open}
                            title="Edit Open Enrollment Student"
                        >
                            {selectedStudent && showConfirm ? (
                                <p>
                                    <u>
                                        Please note that changes to the student&apos;s current grade and/or grade
                                        applying will delete all school choices.
                                    </u>{" "}
                                    Are you sure you wish to proceed with these updates?
                                </p>
                            ) : (
                                <>
                                    <p>
                                        Use this form to edit the following information for{" "}
                                        <span style={{ fontWeight: "bold" }}>
                                            {selectedStudent?.firstName} {selectedStudent?.lastName}
                                        </span>
                                        .
                                    </p>
                                    <EditStudentForm
                                        formState={formState}
                                        formDispatch={formDispatch}
                                        student={selectedStudent}
                                    />
                                </>
                            )}
                            {loader && (
                                <div className="dialog-loader">
                                    Processing... Please Wait <LoadingSvg />
                                </div>
                            )}
                        </DcsdDialog>
                    </>
                )}
            </div>
            {loader && <LoadingSvg />}
        </RbA>
    );
};

export default Students;
