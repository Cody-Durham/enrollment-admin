import React from "react";
import PropTypes from "prop-types";
import Pager from "../formComponents/facetedSearch/Pager";

const StudentsTable = ({ editStudent, facetPagination, setPageNum, students }) => {
    const headers = [
        "Student",
        "Number",
        "Current Grade",
        "Grade Applying",
        "Birthdate",
        "Gender",
        "Address",
        "Current School",
        "Feeder Location",
        "Guardian",
        "Guardian Email",
        "Status",
        "Edit"
    ];
    const colSpan = headers.length;

    return (
        <div className="students-table">
            <table className="mt-4">
                <thead className="sticky-top z-1">
                    <tr>
                        {headers.map((header, index) => {
                            const uniqueKey = `student-header-${index}`;
                            return <th key={uniqueKey}>{header}</th>;
                        })}
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 &&
                        students.map((student, index) => {
                            const uniqueKey = `student-${student.key}-${index}`;
                            const stripe = index % 2 === 0 ? "" : "stripe";
                            const parentName =
                                ["", null].includes(student.parentFirstName) &&
                                ["", null].includes(student.parentLastName)
                                    ? "Parent name not found."
                                    : `${student.parentLastName}, ${student.parentFirstName}`;
                            return (
                                <tr className={stripe} key={uniqueKey}>
                                    <td className="first">
                                        {student.lastName}, {student.firstName}
                                    </td>
                                    <td>{student.studentNumber}</td>
                                    <td>{student.currentGrade}</td>
                                    <td>{student.gradeApplying}</td>
                                    <td>{student.displayBirthdate}</td>
                                    <td className="center">{student.gender}</td>
                                    <td>
                                        {student.addressLine1} {student.addressLine2} {student.city} {student.state}{" "}
                                        {student.zip}
                                    </td>
                                    <td>{student.currentSchoolName}</td>
                                    <td>{student.feederLocationName}</td>
                                    <td>{parentName}</td>
                                    <td className="email">{student.parentEmail}</td>
                                    <td>{student.overrideStatus}</td>
                                    <td className="center last">
                                        <button
                                            aria-label="edit student"
                                            className="btn btn-primary"
                                            name="editStudent"
                                            onClick={() => editStudent(student)}
                                            type="button"
                                        >
                                            <i className="bi bi-pencil-square" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    {students.length === 0 && (
                        <tr>
                            <td className="center first last" colSpan={colSpan}>
                                <div>No Students Found</div>
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={colSpan}>
                            {facetPagination && students.length > 0 && (
                                <div>
                                    <Pager facetPagination={facetPagination} setPageNum={setPageNum} />
                                </div>
                            )}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

StudentsTable.propTypes = {
    editStudent: PropTypes.func.isRequired,
    facetPagination: PropTypes.oneOfType([PropTypes.object]).isRequired,
    setPageNum: PropTypes.func.isRequired,
    students: PropTypes.instanceOf(Array).isRequired
};

export default StudentsTable;
