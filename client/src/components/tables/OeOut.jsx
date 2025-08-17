import React, { Fragment, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { GlobalContext } from "../contextProvider/ContextProvider";
import FacetedSearch from "../formComponents/facetedSearch/FacetedSearch";
import OpenEnrollmentDao from "../../dao/OpenEnrollmentDao";
import { gradeTrans, stringGradeOrdinal } from "../../const/UtilConsts";
import { enumToEnglish } from "../../const/Translations";

const OeOut = ({ availableSlots, locationKey, setAvailableSlots }) => {
    const { state } = useContext(GlobalContext);
    const { oeActiveDistrictWindow, token } = state || {};

    const [outOfList, setOutOfList] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [participatingSchools, setParticipatingSchools] = useState(null);

    /**
     * Get all requests where the student is currently at the locationKey and set the OutOfList where schoolChoice is
     * NOT current school
     */
    useEffect(() => {
        if (locationKey && oeActiveDistrictWindow && token) {
            const params = {};
            params.studentLocationKey = locationKey;
            params.schoolYearKey = oeActiveDistrictWindow.schoolYearKey;
            const paramRequests = {
                facetField: "",
                facetLimit: 100,
                numRows: 50000,
                pageNum: 0,
                sort: "schoolChoiceScore:desc"
            };
            const requestParams = FacetedSearch.getRequestParams(params, paramRequests);
            const options = {
                action: "oeRequestsSearchableRead",
                params: requestParams,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    const { results } = payload;
                    if (results && results.length > 0) {
                        const outs = results.reduce((result, dto) => {
                            if (parseInt(dto.studentLocationKey, 10) !== parseInt(dto.schoolChoiceLocationKey, 10)) {
                                const tmp = {
                                    grade: dto.currentGrade,
                                    student: dto.student
                                };
                                result.push(tmp);
                            }

                            return result;
                        }, []);

                        const uniqueGrades = [...new Set(outs.map((element) => element.grade))];

                        const gradeList = uniqueGrades.reduce((result, grade) => {
                            const match = outs?.filter((obj) => obj.grade === grade);
                            if (match && match.length > 0) {
                                const tmp = {};
                                tmp.grade = grade;
                                tmp.students = [...new Set(match?.map((el) => el.student))];
                                result.push(tmp);
                            }

                            return result;
                        }, []);

                        setOutOfList(gradeList);
                    }
                }
            });
        }
    }, [locationKey, oeActiveDistrictWindow, token]);

    /**
     * Get the available slots for a particular school
     */
    useEffect(() => {
        if (participatingSchools && token) {
            const tmpAvailableSlots = availableSlots || [];
            participatingSchools.forEach((dto) => {
                const { locationDto } = dto;
                const { tags } = locationDto;
                const headerMatch = tags?.filter((obj) => obj.type === "GRADE");
                const headerArr = headerMatch?.filter(
                    (obj) => !["K_FULL", "K_HALF", "K_HALF_AM", "K_HALF_PM"].includes(obj.tag)
                );
                headerArr.sort((a, b) => {
                    return stringGradeOrdinal[a.tag] > stringGradeOrdinal[b.tag] ? 1 : -1;
                });
                setHeaders(headerArr);
                const options = {
                    action: "oeAdminSelectedSchoolDetails",
                    params: {
                        fetchLocationData: true
                    },
                    schoolId: dto.key,
                    token
                };
                OpenEnrollmentDao(options).then((response) => {
                    if (response) {
                        const tmp = {
                            schoolId: dto.key,
                            slots: []
                        };
                        const { payload } = response.data;
                        if (payload) {
                            payload.sort((a, b) => {
                                return stringGradeOrdinal[a.grade] > stringGradeOrdinal[b.grade] ? 1 : -1;
                            });
                            tmp.slots = payload;
                            tmpAvailableSlots.push(tmp);
                            setAvailableSlots([...tmpAvailableSlots]);
                        }
                    }
                });
            });
        }
        /* eslint-disable-next-line */
    }, [participatingSchools, token]);

    /**
     * On a locationKey change, reset participatingSchools and availableSlots
     */
    useEffect(() => {
        if (locationKey && token) {
            setParticipatingSchools(null);
            setAvailableSlots(null);
            const options = {
                action: "oeNonAdminParticipatingSchool",
                params: {
                    fetchLocationData: true
                },
                schoolId: locationKey,
                schoolYearKey: oeActiveDistrictWindow.schoolYearKey,
                token
            };
            OpenEnrollmentDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    setParticipatingSchools(payload);
                }
            });
        }
    }, [locationKey, oeActiveDistrictWindow, setAvailableSlots, token]);

    return (
        <div className="requests-table">
            {availableSlots &&
                availableSlots.map((school, index) => {
                    const schoolMatch = participatingSchools?.filter(
                        (obj) => parseInt(obj.key, 10) === parseInt(school.schoolId, 10)
                    );
                    let displayName = "";
                    if (schoolMatch && schoolMatch.length > 0) {
                        const { educationalTrack, locationDto } = schoolMatch[0];
                        const name = locationDto.name;
                        displayName =
                            educationalTrack === "NOT_APPLICABLE"
                                ? name
                                : `${name} - ${enumToEnglish(educationalTrack)}`;
                    }
                    const { slots } = school;
                    const tableKey = `slots-and-out-table-${index}`;
                    return (
                        <table key={tableKey} className="mt-4">
                            <caption>
                                <b>{displayName || ""}</b>
                            </caption>
                            <thead>
                                <tr>
                                    {headers.map((obj, index) => {
                                        const uniqueKey = `available-out-header-${index}`;
                                        return (
                                            <th key={uniqueKey} colSpan={2}>
                                                {gradeTrans(obj.tag)}
                                            </th>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    {headers.map((obj, index) => {
                                        const uniqueKey = `available-out-subheader-${index}`;
                                        return (
                                            <Fragment key={uniqueKey}>
                                                <th className="subheader center left">available</th>
                                                <th className="subheader center right">out</th>
                                            </Fragment>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {headers.map((gradeObj, index) => {
                                        const uniqueKey = `available-out-body-${index}`;
                                        const first = index === 0 ? "first" : "";
                                        const last = index === headers.length - 1 ? "last" : "";
                                        const match = outOfList?.filter(
                                            (obj) => obj.grade === gradeTrans(gradeObj.tag)
                                        );
                                        return (
                                            <Fragment key={`${uniqueKey}`}>
                                                <td className={`center ${first} oe-out`}>
                                                    {slots && slots[index] ? slots[index].availableCount : "-"}
                                                </td>
                                                <td className={`center ${last} oe-out`}>
                                                    {match && match.length > 0 ? match[0]?.students?.length : 0}
                                                </td>
                                            </Fragment>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    );
                })}
        </div>
    );
};

OeOut.propTypes = {
    availableSlots: PropTypes.instanceOf(Array),
    locationKey: PropTypes.string.isRequired,
    setAvailableSlots: PropTypes.func.isRequired
};

OeOut.defaultProps = {
    availableSlots: null
};

export default OeOut;
