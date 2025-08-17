import React from "react";
import PropTypes from "prop-types";
import DcsdDialog from "./DcsdDialog";
import ActionButton from "../formInputs/buttons/ActionButton";
import { EMPLOYEE_DASHBOARD } from "../../utils/auth/config";

const WindowAndPermissionDialog = ({ changeButtonText, id, open, sorryMessage, sorryTitle }) => {
    const getBackToDialogActions = () => {
        if (changeButtonText && changeButtonText.length > 0) {
            return (
                <a href="https://www.dcsdk12.org/">
                    <ActionButton
                        ariaLabel="Back to DCSD Home"
                        className="action-button-reg"
                        label="Back to DCSD Home"
                    ></ActionButton>
                </a>
            );
        } else {
            return (
                <ActionButton
                    ariaLabel="Back to Employee Dashboard"
                    className="action-button-reg"
                    label="Back to Dashboard"
                    onClick={() => {
                        window.location.replace(EMPLOYEE_DASHBOARD);
                    }}
                />
            );
        }
    };

    return (
        <DcsdDialog actions={getBackToDialogActions()} hasCloseX={false} id={id} open={open} title={sorryTitle}>
            {sorryMessage}
        </DcsdDialog>
    );
};

WindowAndPermissionDialog.propTypes = {
    id: PropTypes.string,
    open: PropTypes.string,
    changeButtonText: PropTypes.string,
    sorryMessage: PropTypes.string,
    sorryTitle: PropTypes.string
};

export default WindowAndPermissionDialog;
