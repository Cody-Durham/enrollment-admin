import { useContext } from "react";
import { GlobalContext } from "./ContextProvider";
import UserDao from "../../dao/UserDao";
/**
 * A collection of context setters
 */

/**
 * SchoolYearPerformance "getter" flag
 * @type {boolean}
 */
let getSY = true;
let getAllSY = true;

/**
 * Get all locations and set it in context
 * @name SetLocationDtos
 * @constructor
 */
export const SetAllLocationDtos = () => {
    const { dispatch, state } = useContext(GlobalContext);
    const { allLocationDtos, token } = state || {};

    if (token && !allLocationDtos) {
        if (getAllSY) {
            getAllSY = false;
            const options = {
                action: "locationsSearchableRead",
                params: {
                    facetField: "locationType",
                    searchString:
                        "locationType=ELEMENTARY_SCHOOL&locationType=MIDDLE_SCHOOL&locationType=HIGH_SCHOOL&locationType=ALTERNATIVE_SCHOOL&locationType=CHARTER_SCHOOL&locationType=ADMINISTRATIVE",
                    sort: "name",
                    numRows: "1000"
                },
                token
            };
            UserDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (payload) {
                        dispatch({
                            type: "AllLocationDtos",
                            allLocationDtos: payload.results
                        });
                    }
                    getAllSY = true;
                }
            });
        }
    }
};

/**
 * Get the schoolYearDto and set it in context
 * @name SetSchoolYearDto
 * @constructor
 */
export const SetSchoolYearDto = () => {
    const { dispatch, state } = useContext(GlobalContext);
    const { schoolYearDto, token } = state || {};

    if (token && !schoolYearDto) {
        if (getSY) {
            getSY = false;
            const options = {
                action: "activeSchoolYearRead",
                token
            };
            UserDao(options).then((response) => {
                if (response) {
                    const { payload } = response.data;
                    if (Object.keys(payload).length) {
                        dispatch({
                            type: "SchoolYearDto",
                            schoolYearDto: payload
                        });
                    }
                    getSY = true;
                }
            });
        }
    }
};
