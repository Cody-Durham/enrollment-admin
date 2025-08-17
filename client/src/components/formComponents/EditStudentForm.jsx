import React from "react";
import PropTypes from "prop-types";

/**
 * Edit existing student's firstName, lastName, gradeApplying, currentGrade and overrideStatus
 * @name EditStudentForm
 * @param {{}} student
 * @return {JSX.Element}
 */
const EditStudentForm = ({ formDispatch, formState, student }) => {
    /* @gradeNames {[]} */
    const gradeNames = [
        "PRE",
        "K",
        "FIRST",
        "SECOND",
        "THIRD",
        "FOURTH",
        "FIFTH",
        "SIXTH",
        "SEVENTH",
        "EIGHTH",
        "NINTH",
        "TENTH",
        "ELEVENTH",
        "TWELFTH"
    ];
    /* @overrides {[]} */
    const overrides = [
        { value: "ALLOW_CURRENT_FEEDER", display: "Allow Current Feeder" },
        { value: "ALLOW_CURRENT_LOCATION", display: "Allow Current Location" },
        { value: "ALLOW_FEEDER_LOCATION", display: "Allow Feeder Location" },
        { value: "DEFAULT_LOCATION_CHECK", display: "Default Location Check" }
    ];

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

    return (
        <form id="student-form">
            <div className="input-row">
                <label htmlFor="first-name">
                    First Name *
                    <input
                        aria-label="student first name"
                        disabled={student?.studentNumber !== null}
                        id="first-name"
                        name="firstName"
                        onChange={handleOnChange}
                        type="text"
                        value={formState.firstName}
                    />
                </label>
                <label htmlFor="last-name">
                    Last Name *
                    <input
                        aria-label="student last name"
                        disabled={student?.studentNumber !== null}
                        id="last-name"
                        name="lastName"
                        onChange={handleOnChange}
                        type="text"
                        value={formState.lastName}
                    />
                </label>
            </div>
            <div className="input-row mt-3">
                <label htmlFor="grade-name">
                    Current Grade *
                    <select
                        aria-label="current grade"
                        disabled={student?.studentNumber !== null}
                        id="grade-name"
                        name="currentGrade"
                        onChange={handleOnChange}
                        value={formState.currentGrade}
                    >
                        {gradeNames.map((grade, index) => {
                            const uniqueKey = `grade-name-option-${index}`;
                            return (
                                <option key={uniqueKey} value={grade}>
                                    {grade}
                                </option>
                            );
                        })}
                    </select>
                </label>
                <label htmlFor="grade-applying">
                    Grade Applying *
                    <select
                        aria-label="grade applying"
                        disabled={student?.studentNumber !== null}
                        id="grade-applying"
                        name="gradeApplying"
                        onChange={handleOnChange}
                        value={formState.gradeApplying}
                    >
                        {gradeNames.map((grade, index) => {
                            const uniqueKey = `grade-applying-option-${index}`;
                            return (
                                <option key={uniqueKey} value={grade}>
                                    {grade}
                                </option>
                            );
                        })}
                    </select>
                </label>
            </div>
            <div className="input-row mt-3">
                <label htmlFor="override-status">
                    Override Status *
                    <select
                        aria-label="override status"
                        id="override-status"
                        name="overrideStatus"
                        onChange={handleOnChange}
                        value={formState.overrideStatus}
                    >
                        {overrides.map((statusObj, index) => {
                            const uniqueKey = `override-status-option-${index}`;
                            return (
                                <option key={uniqueKey} value={statusObj.value}>
                                    {statusObj.display}
                                </option>
                            );
                        })}
                    </select>
                </label>
            </div>
        </form>
    );
};

EditStudentForm.propTypes = {
    formDispatch: PropTypes.func.isRequired,
    formState: PropTypes.oneOfType([PropTypes.object]).isRequired,
    student: PropTypes.oneOfType([PropTypes.object])
};

EditStudentForm.defaultProps = {
    student: null
};

export default EditStudentForm;
