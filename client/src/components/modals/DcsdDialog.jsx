import React from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";

import "../../styles/DcsdModalStyling.scss";

/**
 * A Basic Dialog
 * @name DcsdDialog
 * @param {node} actions
 * @param {string} ariaLabel
 * @param {node} children
 * @param {bool} hasCloseX
 * @param {string} id
 * @param {func} onHide
 * @param {string} open
 * @param {string} title
 * @constructor
 * @return {JSX.Element}
 */
const DcsdDialog = ({ actions, ariaLabel, backdrop, children, hasCloseX, id, keyboard, onHide, open, title }) => {
    return (
        <Modal
            aria-label={ariaLabel}
            backdrop={backdrop} // this "static" is so dialog will NOT close if outside click - otherwise use "staticBackdrop"
            centered // this puts the Modal in the center of the page (up/down)
            keyboard={keyboard}
            scrollable={true}
            onHide={onHide}
            show={open === id}
            size="xl"
        >
            <div className="outer-container">
                {/* "closeButton" is the property passed into the header to enable "X" at top of modal to close*/}
                <Modal.Header closeButton={hasCloseX}>
                    {" "}
                    <div className="text-color">
                        <Modal.Title>{title}</Modal.Title>
                    </div>
                </Modal.Header>
                <div className="text-color body">
                    <Modal.Body
                        style={{
                            maxHeight: "calc(100vh - 210px)",
                            overflowY: "auto"
                        }}
                    >
                        {children}
                    </Modal.Body>
                </div>
                <Modal.Footer>{actions}</Modal.Footer>
            </div>
        </Modal>
    );
};

DcsdDialog.propTypes = {
    actions: PropTypes.node,
    ariaLabel: PropTypes.string,
    backdrop: PropTypes.string,
    children: PropTypes.node,
    hasCloseX: PropTypes.bool,
    id: PropTypes.string,
    keyboard: PropTypes.bool,
    onHide: PropTypes.func,
    open: PropTypes.string,
    title: PropTypes.string
};

DcsdDialog.defaultProps = {
    actions: null,
    ariaLabel: "",
    backdrop: "static",
    children: null,
    hasCloseX: true,
    id: null,
    keyboard: true,
    onHide: null,
    open: null,
    title: null
};

export default DcsdDialog;
