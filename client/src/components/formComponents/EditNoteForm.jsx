import React, { useContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { GlobalContext } from "../contextProvider/ContextProvider";
import FormReducer from "../../utils/FormReducer";
import OpenEnrollmentDao from "../../dao/OpenEnrollmentDao";
import { getCompleteDateTime } from "../../utils/DateFormatter";
import { toast } from "react-toastify";

/**
 * Edit school choice notes
 * @name EditNoteForm
 * @param {{}} selectedRequest
 * @return {JSX.Element}
 */
const EditNoteForm = ({ editNote, handleClick, selectedRequest, setEditNote, setLoader, showHide }) => {
    const { state } = useContext(GlobalContext);
    const { token } = state || {};

    const initialFormState = {
        notes: ""
    };

    const [formState, formDispatch] = useReducer(FormReducer, initialFormState);
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

    const handleNoteSubmit = () => {
        const { notes } = formState;
        const {
            completionDate,
            createdDate,
            key,
            kinderChoice,
            kinderOffer,
            languageChoice,
            languageOffer,
            lastUpdateDate,
            participatingSchoolId,
            randomNumber,
            schoolChoiceScore,
            status,
            student
        } = selectedRequest;
        const data = {
            createdDate: getCompleteDateTime(createdDate),
            completionDate: getCompleteDateTime(completionDate),
            key,
            kinderChoice,
            kinderOffer,
            languageChoice,
            languageOffer,
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
                const { payload } = response.data;
                // NOTE: This is not an ideal coding pattern and probably breaks the immutable rule. Working well but
                // could be improved.
                selectedRequest.notes = notes;
                const idx = editNote.findIndex((item) => parseInt(item, 10) === parseInt(selectedRequest.key, 10));
                if (idx !== -1) {
                    const tmpEditNote = editNote;
                    tmpEditNote.splice(idx, 1);
                    setEditNote([...tmpEditNote]);
                }
                showHide(payload.key);
                toast.success(`Note for ${selectedRequest.firstName} ${selectedRequest.lastName} successfully saved.`);
            } else {
                toast.error(
                    `Unable to save note for ${selectedRequest.firstName} ${selectedRequest.lastName}. Please try again`
                );
            }
            setLoader(false);
        });
    };

    /**
     * Update formState
     */
    useEffect(() => {
        const tmpFormState = formState;
        tmpFormState.notes = selectedRequest.notes;
        formDispatch({
            type: "reset",
            payload: { ...tmpFormState }
        });
        /* eslint-disable-next-line */
    }, [selectedRequest]);

    return (
        <form id="request-form">
            <div>
                <textarea
                    aria-label="notes textarea"
                    id={`notes-${selectedRequest.key}`}
                    maxLength={1000}
                    name="notes"
                    onChange={handleOnChange}
                    rows={4}
                    value={`${formState.notes}`}
                />
            </div>
            <div style={{ marginTop: "5px" }}>
                <button
                    aria-label="cancel button"
                    className="btn btn-secondary small"
                    name="editNote"
                    onClick={() => {
                        const idx = editNote.findIndex(
                            (item) => parseInt(item, 10) === parseInt(selectedRequest.key, 10)
                        );
                        if (idx !== -1) {
                            const tmpEditNote = editNote;
                            tmpEditNote.splice(idx, 1);
                            setEditNote([...tmpEditNote]);
                        }
                        if (selectedRequest.notes === "") {
                            handleClick("hide", selectedRequest.key);
                        }
                    }}
                    type="button"
                >
                    Cancel
                </button>
                <button
                    aria-label="save note"
                    className="btn btn-primary small"
                    name="saveNote"
                    onClick={handleNoteSubmit}
                    type="button"
                >
                    Save Note
                </button>
            </div>
        </form>
    );
};

EditNoteForm.propTypes = {
    editNote: PropTypes.instanceOf(Array).isRequired,
    handleClick: PropTypes.func.isRequired,
    showHide: PropTypes.func.isRequired,
    selectedRequest: PropTypes.oneOfType([PropTypes.object]).isRequired,
    setEditNote: PropTypes.func.isRequired,
    setLoader: PropTypes.func.isRequired
};

export default EditNoteForm;
