import React, { useContext, useEffect, useReducer, useState } from "react";
import PropTypes from "prop-types";

import CheckboxButton from "./CheckboxButton";
import FormReducer from "../../utils/FormReducer";
import LoadingSvg from "../loadingSvg/LoadingSvg";
import OpenEnrollmentDao from "../../dao/OpenEnrollmentDao";

import { GlobalContext } from "../contextProvider/ContextProvider";
import { kinderObj, languageObj, statusObj, getReadableStatus } from "../../const/UtilConsts";
import { trans } from "../../const/UtilConsts";

/**
 * Edit school choice status (and kinderOffer, languageOffer, if appropriate)
 * @name EditOperationForm
 * @param {{}} selectedRequest
 * @return {JSX.Element}
 */
const EditOperationForm = ({ isOeAdmin, loader, selectedRequest, setOperationData }) => {
    const { state } = useContext(GlobalContext);
    const { oeActiveDistrictWindow, token } = state || {};

    const initialFormState = {
        kinderOffer: "",
        languageOffer: "",
        status: ""
    };

    const [formState, formDispatch] = useReducer(FormReducer, initialFormState);

    const [kinderOptions, setKinderOptions] = useState([]);
    const [languageOptions, setLanguageOptions] = useState([]);
    const [locationData, setLocationData] = useState(null);
    const [statusOptions, setStatusOptions] = useState([]);

    /**
     * Controlled input change handler
     * @name handleOnChange
     * @param {{}} e
     */
    const handleOnChange = (e) => {
        const { name, value } = e.target;

        const tmpFormState = formState;
        tmpFormState[name] = value;
        setOperationData({ ...tmpFormState });
        formDispatch({
            type: "reset",
            payload: { ...tmpFormState }
        });
    };

    /**
     * Do we show the language options?
     * @name showLanguageOptions
     * @return {bool}
     */
    const showLanguageOptions = () => {
        return selectedRequest.languageChoice && languageOptions && selectedRequest.status !== "MAKE_OFFER_PENDING";
    };

    /**
     * Prime the formState from selectedRequests
     */
    useEffect(() => {
        if (selectedRequest) {
            const { enrollmentRound } = oeActiveDistrictWindow;
            const tmpFormState = formState;
            tmpFormState.kinderOffer = selectedRequest.kinderOffer || "";
            tmpFormState.languageOffer = selectedRequest.languageOffer || "";
            tmpFormState.status = selectedRequest.status || "";
            let sOptions = [];
            if (enrollmentRound === "ROUND2") {
                sOptions = statusObj.filter((obj) => ["MAKE_OFFER"].includes(obj.value));
            } else {
                if (selectedRequest.status === "REQUEST") {
                    sOptions = statusObj.filter((obj) => obj.value === "MAKE_OFFER_PENDING");
                } else if (selectedRequest.status === "MAKE_OFFER_PENDING") {
                    if (isOeAdmin()) {
                        sOptions = statusObj.filter((obj) => ["MAKE_OFFER"].includes(obj.value));
                    } else {
                        sOptions = [{ value: "REQUEST", display: "Cancel Pending Offer" }];
                    }
                }
            }
            setStatusOptions(sOptions);
            if (sOptions.length === 1) {
                tmpFormState.status = sOptions[0].value;
            }
            setOperationData({ ...tmpFormState });
            formDispatch({
                type: "reset",
                payload: { ...tmpFormState }
            });
        }
        /* eslint-disable-next-line */
    }, [oeActiveDistrictWindow, selectedRequest]);

    /**
     * Get School Location tags from the selectedRequest
     */
    useEffect(() => {
        if (oeActiveDistrictWindow && selectedRequest && token && !locationData) {
            const options = {
                action: "oeNonAdminParticipatingSchool",
                params: {
                    fetchLocationData: true
                },
                schoolId: selectedRequest.schoolChoiceLocationKey,
                schoolYearKey: oeActiveDistrictWindow.schoolYearKey,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload && payload.length > 0) {
                        setLocationData(payload[0].locationDto);
                    }
                }
            });
        }
    }, [oeActiveDistrictWindow, locationData, selectedRequest, token]);

    /**
     * Once locationData is set, get kinderOptions and languageOptions
     */
    useEffect(() => {
        if (locationData && selectedRequest) {
            const kOptions = [];
            const lOptions = [];
            const kinderOffered = locationData.tags?.filter((obj) => obj.type === "KINDER_OFFERED");
            if (kinderOffered && kinderOffered.length > 0) {
                kinderOffered.forEach((tag) => {
                    const kinderMatch = kinderObj.filter((obj) => obj.value === tag.tag);
                    kOptions.push(kinderMatch[0]);
                });
                setKinderOptions(kOptions);
            }
            const languageOffered = locationData.tags?.filter((obj) => obj.type === "LANGUAGE");
            if (languageOffered && languageOffered.length > 0) {
                languageOffered.forEach((tag) => {
                    const languageMatch = languageObj.filter((obj) => obj.value === tag.tag);
                    lOptions.push(languageMatch[0]);
                });
                setLanguageOptions(lOptions);
            }
            if (kOptions.length === 1 && selectedRequest.gradeApplying === "K") {
                const tmpFormState = formState;
                tmpFormState.kinderOffer = kOptions[0].value;
                setOperationData({ ...tmpFormState });
                formDispatch({
                    type: "reset",
                    payload: { ...tmpFormState }
                });
            }
            if (lOptions.length === 1) {
                const tmpFormState = formState;
                tmpFormState.languageOffer = lOptions[0].value;
                setOperationData({ ...tmpFormState });
                formDispatch({
                    type: "reset",
                    payload: { ...tmpFormState }
                });
            }
        }
        /* eslint-disable-next-line */
    }, [locationData, selectedRequest]);

    return (
        <form id="request-form">
            <div className="input-row mt-3">
                <label htmlFor="status">
                    Status
                    <select
                        aria-label="status"
                        disabled={statusOptions?.length < 2}
                        id="status"
                        name="status"
                        onChange={handleOnChange}
                        value={formState.status}
                    >
                        {statusOptions.map((status, index) => {
                            const uniqueKey = `status-option-${index}`;
                            return (
                                <option key={uniqueKey} value={status.value}>
                                    {status.display}
                                </option>
                            );
                        })}
                    </select>
                </label>
                <div style={{ textAlign: "left", width: "50%" }}>
                    <div>
                        <b>Current Status:</b>
                    </div>
                    <p>{getReadableStatus(selectedRequest.status)}</p>
                </div>
            </div>
            <div className="input-row mt-3">
                {selectedRequest.kinderChoice && kinderOptions && selectedRequest.status !== "MAKE_OFFER_PENDING" && (
                    <>
                        <div className="checkbox enroll-flex" style={{ width: "50%" }}>
                            <div>
                                <b>Kinder Offer:</b>
                            </div>
                            {kinderOptions.map((kinder, index) => {
                                const uniqueKey = `kinder-offer-${index}`;
                                const isChecked = kinder.value === formState.kinderOffer;
                                return (
                                    <CheckboxButton
                                        checked={isChecked}
                                        className="check-small-label check-small-line-height ms-2"
                                        handleOnChange={handleOnChange}
                                        id={`kinder-offer-${index}`}
                                        key={uniqueKey}
                                        label={trans(kinder.display)}
                                        name="kinderOffer"
                                        type="radio"
                                        value={kinder.value}
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
                    </>
                )}
            </div>
            <div className="input-row mt-3">
                {showLanguageOptions() && (
                    <>
                        <div className="checkbox enroll-flex" style={{ width: "50%" }}>
                            <div>
                                <b>Language Offer:</b>
                            </div>
                            {languageOptions.map((language, index) => {
                                const uniqueKey = `language-offer-${index}`;
                                const isChecked = language.value === formState.languageOffer;
                                return (
                                    <CheckboxButton
                                        checked={isChecked}
                                        className="check-small-label check-small-line-height ms-2"
                                        handleOnChange={handleOnChange}
                                        id={`language-offer-${index}`}
                                        key={uniqueKey}
                                        label={trans(language.display)}
                                        name="languageOffer"
                                        type="radio"
                                        value={language.value}
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
                    </>
                )}
            </div>
            {loader && <LoadingSvg />}
        </form>
    );
};

EditOperationForm.propTypes = {
    isOeAdmin: PropTypes.func.isRequired,
    loader: PropTypes.bool.isRequired,
    selectedRequest: PropTypes.oneOfType([PropTypes.object]).isRequired,
    setOperationData: PropTypes.func.isRequired
};

export default EditOperationForm;
