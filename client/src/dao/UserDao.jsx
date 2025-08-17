import PropTypes from "prop-types";

import {
    USER_ACCESS_CONTROLS,
    USER_ACTIVE_SCHOOL_YEAR,
    USER_ATTRIBUTES_UPDATE,
    USER_INSTRUCTIONAL_AREA,
    USER_DETAILS,
    USER_LOCATION_BY_KEY,
    USER_LOCATION_SEARCHABLE_GET,
    USER_PERMISSIONS,
    USER_SCHOOL_YEAR,
    USER_SERVICE,
    USER_SUMMARIES,
    USER_SYNC
} from "../const/UserConst";
import ServiceWrapper from "../utils/ServiceWrapper";

/**
 * Data Access for the User API
 * @name UserDao
 * @param props
 * @return {null|*}
 */
const UserDao = (props) => {
    const { action, data, guid, key, params, targetGuid, token, tool, username } = props;
    const bearer = `Bearer ${token}`;
    const options = {
        headers: {
            Authorization: bearer
        },
        withCredentials: true
    };
    switch (action) {
        case "activeSchoolYearRead":
            options.method = "GET";
            options.url = USER_ACTIVE_SCHOOL_YEAR;
            break;
        case "locationByKeyRead":
            options.method = "GET";
            options.url = `${USER_LOCATION_BY_KEY}/${key}/index.json`;
            break;
        case "locationsSearchableRead":
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.url = USER_LOCATION_SEARCHABLE_GET;
            break;
        case "schoolYearRead":
            options.method = "GET";
            options.url = `${USER_SCHOOL_YEAR}/${key}/detail.json`;
            break;
        case "schoolYearsRead":
            options.method = "GET";
            options.url = `${USER_SCHOOL_YEAR}/index.json`;
            break;
        case "userAccessRead":
            options.method = "GET";
            options.url = `${USER_ACCESS_CONTROLS}/${guid}/${targetGuid}/detail.json`;
            break;
        case "userAttributesUpdate":
            options.data = data;
            options.method = "PUT";
            options.url = `${USER_ATTRIBUTES_UPDATE}/${guid}/index.json`;
            break;
        case "userDetailsRead":
            options.method = "GET";
            options.url = `${USER_SERVICE}/${username}/details.json`;
            break;
        case "userDetailsByGuidRead":
            options.method = "GET";
            options.url = `${USER_SERVICE}/guid/${guid}/details.json`;
            break;
        case "userInstructionalAreaRead":
            options.method = "GET";
            options.url = `${USER_INSTRUCTIONAL_AREA}/${guid}/index.json`;
            break;
        case "userPermissionsRead":
            options.method = "GET";
            options.url = `${USER_PERMISSIONS}/${guid}/${tool.toUpperCase()}/detail.json`;
            break;
        case "userSummariesRead":
            options.method = "GET";
            if (params) {
                options.params = params; // role=ROLE_EMPLOYEE&statuses=ACTIVE
            }
            options.url = USER_SUMMARIES;
            break;
        case "usersByGuidRead":
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.url = USER_DETAILS;
            break;
        case "userSync":
            options.method = "GET";
            options.url = `${USER_SYNC}/${username}/details.json`;
            break;
        default:
            return null;
    }

    return ServiceWrapper.serviceCall({
        options,
        ...props
    });
};

UserDao.propTypes = {
    action: PropTypes.string.isRequired,
    data: PropTypes.objectOf([PropTypes.object]),
    guid: PropTypes.string,
    key: PropTypes.string,
    params: PropTypes.objectOf([PropTypes.object]),
    targetGuid: PropTypes.string,
    token: PropTypes.string.isRequired,
    tool: PropTypes.string,
    username: PropTypes.string
};

UserDao.defaultProps = {
    data: null,
    guid: null,
    key: null,
    params: null,
    targetGuid: null,
    tool: null,
    username: null
};

export default UserDao;
