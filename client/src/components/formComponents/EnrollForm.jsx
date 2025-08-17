import React, { useContext, useEffect, useReducer, useState } from "react";
import PropTypes from "prop-types";

import CheckboxButton from "./CheckboxButton";
import FormReducer from "../../utils/FormReducer";
import GoldenRodBox from "../goldenRodBox/GoldenRodBox";
import LoadingSvg from "../loadingSvg/LoadingSvg";
import OpenEnrollmentDao from "../../dao/OpenEnrollmentDao";

import { getReadableStatus, trans } from "../../const/UtilConsts";
import { GlobalContext } from "../contextProvider/ContextProvider";

/**
 * Edit a school choice score
 * @name EnrollForm
 * @param {bool} loader
 * @param {{}} selectedRequest
 * @param {func} setOperationData
 * @param {bool} unableToEnroll
 * @return {JSX.Element}
 */
const EnrollForm = ({ editOfferSuccess, loader, selectedRequest, setOperationData, unableToEnroll }) => {
    const { state } = useContext(GlobalContext);
    const { oeActiveDistrictWindow, token } = state || {};

    const initialFormState = {
        kinderOffer: "",
        languageOffer: "",
        status: ""
    };

    const [formState, formDispatch] = useReducer(FormReducer, initialFormState);

    const [kinderOptions, setKinderOptions] = useState(null);
    const [languageOptions, setLanguageOptions] = useState(null);
    const [successMessage, setSuccessMessage] = useState("Successfully updated the open enrollment request.");

    /**
     * Controlled input change handler
     * @name handleOnChange
     * @param {{}} e
     */
    const handleOnChange = (e) => {
        const { name, value } = e.target;
        formDispatch({
            type: "text",
            field: name,
            payload: value
        });
    };

    /**
     * Re-init formState on selectedRequest
     */
    useEffect(() => {
        if (selectedRequest) {
            const { gradeApplying, kinderOffer, languageChoiceList, languageOffer } = selectedRequest;
            if (gradeApplying === "K") {
                if (kinderOffer) {
                    formDispatch({
                        type: "text",
                        field: "kinderOffer",
                        payload: kinderOffer
                    });
                }
            }
            if (languageChoiceList) {
                if (languageOffer) {
                    formDispatch({
                        type: "text",
                        field: "languageOffer",
                        payload: languageOffer
                    });
                }
            }
            formDispatch({
                type: "text",
                field: "status",
                payload: selectedRequest.status
            });
        }
    }, [selectedRequest]);

    /**
     * Copy to operationData any changes to formState
     */
    useEffect(() => {
        setOperationData(formState);
    }, [formState, setOperationData]);

    /**
     * Get all the appropriate offer options at the location
     */
    useEffect(() => {
        if (selectedRequest && token) {
            const options = {
                action: "oeNonAdminParticipatingSchool",
                params: {
                    fetchLocationData: true
                },
                schoolId: parseInt(selectedRequest.schoolChoiceLocationKey, 10),
                schoolYearKey: oeActiveDistrictWindow.schoolYearKey,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload && payload.length > 0) {
                        const schoolMatch = payload.filter(
                            (school) => parseInt(school.key, 10) === parseInt(selectedRequest.participatingSchoolId, 10)
                        );
                        if (schoolMatch && schoolMatch.length > 0) {
                            const { locationDto } = schoolMatch[0];
                            const { tags } = locationDto;
                            const kinderMatch = tags.filter((obj) => obj.type === "KINDER_OFFERED");
                            const languageMatch = tags.filter((obj) => obj.type === "LANGUAGE");
                            if (kinderMatch && kinderMatch.length > 0) {
                                const kOptions = [...new Set(kinderMatch.map((el) => el.tag))].sort((a, b) => {
                                    return a > b ? 1 : -1;
                                });
                                setKinderOptions(kOptions);
                            }
                            if (languageMatch && languageMatch.length > 0) {
                                const lOptions = [...new Set(languageMatch.map((el) => el.tag))].sort((a, b) => {
                                    return a > b ? 1 : -1;
                                });
                                setLanguageOptions(lOptions);
                            }
                        }
                    }
                }
            });
        }
    }, [oeActiveDistrictWindow, selectedRequest, token]);

    /**
     * Construct a request status edit success message
     */
    useEffect(() => {
        if (selectedRequest) {
            let tmpSuccessMessage = "Successfully updated the open enrollment request.";
            const { kinderOffer, languageOffer } = selectedRequest;
            if (kinderOffer && kinderOffer !== formState.kinderOffer) {
                tmpSuccessMessage = `${tmpSuccessMessage} Kinder Offer changed to ${formState.kinderOffer}.`;
            }
            if (languageOffer && languageOffer !== formState.languageOffer) {
                tmpSuccessMessage = `${tmpSuccessMessage} Language Offer changed to ${formState.languageOffer}.`;
            }
            setSuccessMessage(tmpSuccessMessage);
        }
    }, [formState, selectedRequest]);

    return (
        <>
            <h5>
                <b>
                    {selectedRequest.firstName} {selectedRequest.lastName}
                </b>
            </h5>
            <table id="enroll-table">
                <tbody>
                    {selectedRequest.studentNumber && (
                        <tr>
                            <td>
                                <i>Student Number:</i>
                            </td>
                            <td>
                                <b>{selectedRequest.studentNumber}</b>
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td style={{ width: "150px" }}>
                            <i>Grade Applying:</i>
                        </td>
                        <td>
                            <b>{selectedRequest.gradeApplying}</b>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <i>Birthdate:</i>
                        </td>
                        <td>
                            <b>{selectedRequest.displayBirthdate}</b>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <i>Gender:</i>
                        </td>
                        <td>
                            <b>{selectedRequest.gender}</b>
                        </td>
                    </tr>
                    {selectedRequest.addressLine1 && (
                        <tr>
                            <td valign="top">
                                <i>Address:</i>
                            </td>
                            <td>
                                <b>
                                    {selectedRequest.addressLine1}
                                    <br />
                                    {selectedRequest.addressLine2 && (
                                        <>
                                            {selectedRequest.addressLine2}
                                            <br />
                                        </>
                                    )}
                                    {selectedRequest.city}, {selectedRequest.state} {selectedRequest.zip}
                                </b>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <hr />
            {!editOfferSuccess ? (
                !unableToEnroll && (
                    <form id="enroll-form">
                        {selectedRequest.gradeApplying === "K" && kinderOptions && (
                            <div className="input-row">
                                <div className="checkbox enroll-flex">
                                    <div>
                                        <b>Kinder Offer:</b>
                                    </div>
                                    {kinderOptions.map((item, index) => {
                                        const uniqueKey = `kinder-offer-${index}`;
                                        const isChecked = item === formState.kinderOffer;
                                        return (
                                            <CheckboxButton
                                                checked={isChecked}
                                                className="check-small-label check-small-line-height ms-2"
                                                handleOnChange={handleOnChange}
                                                id={`kinder-offer-${index}`}
                                                key={uniqueKey}
                                                label={trans(item)}
                                                name="kinderOffer"
                                                type="radio"
                                                value={item}
                                            />
                                        );
                                    })}
                                </div>
                                <div style={{ textAlign: "left", width: "50%" }}>
                                    <div>
                                        <b>Kinder Choice:</b>
                                    </div>
                                    <p>{getReadableStatus(selectedRequest.kinderChoice)}</p>
                                </div>
                            </div>
                        )}
                        {languageOptions && (
                            <div className="input-row mt-3">
                                <div className="checkbox enroll-flex">
                                    <div>
                                        <b>Language Offer:</b>
                                    </div>
                                    {languageOptions.map((item, index) => {
                                        const uniqueKey = `language-offer-${index}`;
                                        const isChecked = item === formState.languageOffer;
                                        return (
                                            <CheckboxButton
                                                checked={isChecked}
                                                className="check-small-label check-small-line-height ms-2"
                                                handleOnChange={handleOnChange}
                                                id={`language-offer-${index}`}
                                                key={uniqueKey}
                                                label={trans(item)}
                                                name="languageOffer"
                                                type="radio"
                                                value={item}
                                            />
                                        );
                                    })}
                                </div>
                                <div style={{ textAlign: "left", width: "50%" }}>
                                    <div>
                                        <b>Language Choice:</b>
                                    </div>
                                    <p>{getReadableStatus(selectedRequest.languageChoice)}</p>
                                </div>
                            </div>
                        )}
                        <br />
                        {loader && <LoadingSvg />}
                    </form>
                )
            ) : (
                <p className="success-p">{successMessage}</p>
            )}
            {unableToEnroll ? (
                <div className="enroll-p danger-p">
                    Unfortunately, the system was unable to create a user account in Infinite Campus for the guardian.
                    <ul>
                        <li>
                            Please verify that the &quot;Open Enrolled Guardian&quot; checkbox (in the District Defined
                            Elements section of Infinite Campus) is checked.
                        </li>
                        <li>
                            Please verify that the Person Record for the guardian does not have typos and matches
                            exactly the values from the Open Enrollment application - this includes: email, first name,
                            and last name.
                        </li>
                    </ul>
                    After correcting the information in Infinite Campus, please try again to submit to create the
                    guardian&apos;s user account.
                </div>
            ) : selectedRequest.studentNumber ? (
                <GoldenRodBox
                    label="Student already exists in Infinite Campus."
                    message="Please search for the student in Infinite Campus, and make sure that you created a valid line of
                        enrollment."
                />
            ) : (
                <p className="enroll-p">
                    When you submit, we will attempt to create a User Account in Infinite Campus for the guardian.
                </p>
            )}
        </>
    );
};

EnrollForm.propTypes = {
    editOfferSuccess: PropTypes.bool,
    loader: PropTypes.bool,
    selectedRequest: PropTypes.oneOfType([PropTypes.object]).isRequired,
    setOperationData: PropTypes.func.isRequired,
    unableToEnroll: PropTypes.bool
};

EnrollForm.defaultProps = {
    editOfferSuccess: false,
    loader: false,
    unableToEnroll: false
};

export default EnrollForm;
