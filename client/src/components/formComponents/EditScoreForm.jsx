import React, { useContext, useEffect, useReducer, useState } from "react";
import PropTypes from "prop-types";
import { GlobalContext } from "../contextProvider/ContextProvider";
import FormReducer from "../../utils/FormReducer";
import OpenEnrollmentDao from "../../dao/OpenEnrollmentDao";
import CheckboxButton from "./CheckboxButton";
import LoadingSvg from "../loadingSvg/LoadingSvg";

/**
 * Edit a school choice score
 * @name EditScoreForm
 * @param {bool} loader
 * @param {{}} selectedRequest
 * @param {func} setLoader
 * @param {func} setScoringData
 * @return {JSX.Element}
 */
const EditScoreForm = ({ loader, selectedRequest, setLoader, setScoringData }) => {
    const { state } = useContext(GlobalContext);
    const { allLocationDtos, token, userDetails } = state || {};

    const initialFormState = {
        customScores: []
    };

    const [formState, formDispatch] = useReducer(FormReducer, initialFormState);

    const [enrollmentPriorities, setEnrollmentPrioirities] = useState(null);
    const [existingScores, setExistingScores] = useState(null);

    /**
     * Controlled input change handler
     * @name handleOnChange
     * @param {{}} e
     */
    const handleOnChange = (e) => {
        const { value, checked } = e.target;
        const tmpFormState = formState;
        const { customScores } = tmpFormState;
        const enrollmentMatch = enrollmentPriorities?.filter((dto) => parseInt(dto.key, 10) === parseInt(value, 10));
        if (enrollmentMatch && enrollmentMatch.length > 0) {
            let scoreDto = {
                key: null,
                schoolChoiceId: selectedRequest.key,
                enrollmentPriorityId: value,
                scoringType: enrollmentMatch[0].scoringType,
                criteria: enrollmentMatch[0].criteria,
                pointValue: Math.pow(2, parseInt(enrollmentMatch[0].priorityScore, 10)),
                creatorGuid: userDetails?.uid || null
            };

            const existing = existingScores?.filter(
                (dto) => parseInt(dto.enrollmentPriorityId, 10) === parseInt(value, 10)
            );
            if (existing && existing.length > 0) {
                scoreDto = existing[0];
            }

            if (checked) {
                customScores.push(scoreDto);
            } else {
                const newCustomScores = customScores.filter(
                    (dto) => parseInt(dto.enrollmentPriorityId, 10) !== parseInt(value, 10)
                );
                tmpFormState.customScores = newCustomScores;
            }

            setScoringData(tmpFormState.customScores);
            formDispatch({
                type: "reset",
                payload: { ...tmpFormState }
            });
        }
    };

    /**
     * Retrieve the scores available for the selected school. If none, retrieve the District's custom scoring
     */
    useEffect(() => {
        if (allLocationDtos && selectedRequest && token && !enrollmentPriorities) {
            setLoader(true);
            const options = {
                action: "oeEnrollmentPrioritiesRead",
                locKey: selectedRequest.schoolChoiceLocationKey,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload && payload.length > 0) {
                        const custom = payload.filter((dto) => dto.scoringType === "CUSTOM");
                        if (custom && custom.length > 0) {
                            setEnrollmentPrioirities(custom);
                        }
                    } else {
                        const locationDto = allLocationDtos?.filter(
                            (dto) =>
                                dto.locationType !== "CHARTER_SCHOOL" &&
                                parseInt(dto.key, 10) === parseInt(selectedRequest.schoolChoiceLocationKey, 10)
                        );
                        if (locationDto && locationDto.length > 0) {
                            const optionsDistrict = {
                                action: "oeEnrollmentPrioritiesRead",
                                locKey: "0",
                                token
                            };
                            OpenEnrollmentDao(optionsDistrict).then((responseDistrict) => {
                                if (responseDistrict) {
                                    const customDistrict = responseDistrict.data.payload?.filter(
                                        (dto) => dto.scoringType === "CUSTOM"
                                    );
                                    if (customDistrict && customDistrict.length > 0) {
                                        setEnrollmentPrioirities(customDistrict);
                                    }
                                }
                            });
                        }
                    }
                }
                setLoader(false);
            });
        }
        /* eslint-disable-next-line */
    }, [allLocationDtos, enrollmentPriorities, selectedRequest, token]);

    /**
     * Retrieve any existing scores for the school choice request
     */
    useEffect(() => {
        if (selectedRequest && token && !existingScores) {
            const options = {
                action: "oeSchoolChoiceScoresRead",
                schoolChoiceKey: selectedRequest.key,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    setExistingScores(payload);
                }
            });
        }
    }, [existingScores, selectedRequest, token]);

    /**
     * With the enrollmentPriority ID, get any pre-selected custom scoring
     */
    useEffect(() => {
        if (enrollmentPriorities) {
            const existing = enrollmentPriorities.reduce((results, dto) => {
                if (existingScores) {
                    const scoreMatch = existingScores.filter(
                        (obj) => parseInt(obj.enrollmentPriorityId, 10) === parseInt(dto.key, 10)
                    );
                    if (scoreMatch && scoreMatch.length > 0) {
                        results.push(scoreMatch[0]);
                    }
                }
                return results;
            }, []);
            const tmpFormState = formState;
            tmpFormState.customScores = existing;
            setScoringData(tmpFormState.customScores);
            formDispatch({
                type: "reset",
                payload: { ...tmpFormState }
            });
        }
        /* eslint-disable-next-line */
    }, [existingScores, enrollmentPriorities]);

    return (
        <form id="request-form">
            {enrollmentPriorities ? (
                <div className="checkbox">
                    {enrollmentPriorities.map((dto, index) => {
                        const uniqueKey = `custom-score-${dto.key}-${index}`;
                        const { customScores } = formState;
                        const scoreMatch = customScores?.filter(
                            (obj) => parseInt(obj.enrollmentPriorityId, 10) === parseInt(dto.key, 10)
                        );
                        const isChecked = scoreMatch && scoreMatch.length > 0;
                        return (
                            <CheckboxButton
                                checked={isChecked}
                                className="check-small-label ms-2"
                                handleOnChange={handleOnChange}
                                id={`score-${dto.key}`}
                                key={uniqueKey}
                                label={`${dto.displayName} (${Math.pow(2, dto.priorityScore)} points)`}
                                name="customScores"
                                type="checkbox"
                                value={dto.key}
                            />
                        );
                    })}
                </div>
            ) : (
                !loader && <div>There are no Custom Scoring Options for this location</div>
            )}
            {loader && <LoadingSvg />}
        </form>
    );
};

EditScoreForm.propTypes = {
    loader: PropTypes.bool,
    selectedRequest: PropTypes.oneOfType([PropTypes.object]).isRequired,
    setLoader: PropTypes.func.isRequired,
    setScoringData: PropTypes.func.isRequired
};

EditScoreForm.defaultProps = {
    loader: false
};

export default EditScoreForm;
