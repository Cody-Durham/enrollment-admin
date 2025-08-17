import React from "react";
import PropTypes from "prop-types";

/**
 * Display the Requests table legend
 * @name LegendTable
 * @param {func} param0
 * @return {JSX.Element}
 */
const LegendTable = ({ isOeAdmin }) => {
    return (
        <table id="legend-table">
            <thead>
                <tr>
                    <th colSpan={2}>* Legend</th>
                </tr>
            </thead>
            <tbody>
                <tr className="out-of-district">
                    <td className="highlight first" width={120}>
                        (<i>Highlighted Row</i>)
                    </td>
                    <td>
                        <b>Student new to DCSD or applying to their current/feeder location.</b>
                    </td>
                </tr>
                <tr>
                    <td className={isOeAdmin() ? "first" : "first"}>
                        <span className="sibling-icon">
                            <i className="bi bi-people-fill" />
                        </span>
                    </td>
                    <td>
                        <b>Sibling Applied</b>
                        <br />
                        <span style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
                            <b>Note:</b> In some cases, siblings may not show up grouped together. If you see a student
                            with a sibling icon but do not see the corresponding sibling(s), please try searching by
                            parent/guardian username.
                        </span>
                    </td>
                </tr>
                <tr>
                    <td className={isOeAdmin() ? "first" : "first last"}>
                        <span className="macanta">M</span>
                    </td>
                    <td className={isOeAdmin() ? "" : "last"}>
                        <b>Macanta Resident</b>
                        <br />
                        <span style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
                            <b>Note:</b> Priority points available only for OE applications to neighborhood schools.
                        </span>
                    </td>
                </tr>
                {isOeAdmin() && (
                    <tr>
                        <td className="first last">
                            <span className="iep">IEP</span>
                        </td>
                        <td className="last">
                            <b>Individualized Education Plan</b>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

LegendTable.propTypes = {
    isOeAdmin: PropTypes.func.isRequired
};

export default LegendTable;
