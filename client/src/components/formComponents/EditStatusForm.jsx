import React, { useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import FormReducer from "../../utils/FormReducer";
import LoadingSvg from "../loadingSvg/LoadingSvg";
import { statusObj, getReadableStatus } from "../../const/UtilConsts";

/**
 * Edit school choice status (and kinderOffer, languageOffer, if appropriate)
 * @name EditStatusForm
 * @param {{}} selectedRequest
 * @return {JSX.Element}
 */
const EditStatusForm = ({ loader, operationStatus, selectedRequest, setStatusData }) => {
    const initialFormState = {
        status: ""
    };

    const [formState, formDispatch] = useReducer(FormReducer, initialFormState);

    /**
     * Controlled input change handler
     * @name handleOnChange
     * @param {{}} e
     */
    const handleOnChange = (e) => {
        const { name, value } = e.target;

        const tmpFormState = formState;
        tmpFormState[name] = value;
        setStatusData({ ...tmpFormState });
        formDispatch({
            type: "reset",
            payload: { ...tmpFormState }
        });
    };

    /**
     * Prime the formState from selectedRequests
     */
    useEffect(() => {
        if (selectedRequest) {
            const tmpFormState = formState;
            if (operationStatus) {
                tmpFormState.status = operationStatus;
            } else {
                tmpFormState.status = selectedRequest.status || "";
            }
            setStatusData({ ...tmpFormState });
            formDispatch({
                type: "reset",
                payload: { ...tmpFormState }
            });
        }
        /* eslint-disable-next-line */
    }, [operationStatus, selectedRequest]);

    return (
        <form id="request-form">
            <div className="input-row mt-3">
                <label htmlFor="status">
                    Status
                    <select
                        aria-label="status"
                        disabled={operationStatus !== null}
                        id="status"
                        name="status"
                        onChange={handleOnChange}
                        value={formState.status}
                    >
                        {statusObj.map((status, index) => {
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
            {loader && <LoadingSvg />}
        </form>
    );
};

EditStatusForm.propTypes = {
    loader: PropTypes.bool.isRequired,
    operationStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    selectedRequest: PropTypes.oneOfType([PropTypes.object]).isRequired,
    setLoader: PropTypes.func.isRequired,
    setStatusData: PropTypes.func.isRequired
};

EditStatusForm.defaultProps = {
    operationStatus: null
};

export default EditStatusForm;
