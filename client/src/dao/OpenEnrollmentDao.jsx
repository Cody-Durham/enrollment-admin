import PropTypes from "prop-types";
import ServiceWrapper from "../utils/ServiceWrapper";
import {
    OE_ADMIN_PARTICIPATING_SCHOOLS,
    OE_ADMIN_PARTICIPATING_SCHOOL_DETAILS,
    OE_DISTRICT_WINDOWS_BY_YEAR,
    OE_NON_ADMIN_PARTICIPATING_SCHOOL,
    OE_ACTION_CONTROLS,
    OE_ACTIVE_CONTROLS,
    OE_ACTIVE_DISTRICT_WINDOW,
    OE_ENROLLMENT_PRIORITY_BY_LOCATION,
    OE_REQUEST,
    OE_REQUESTS_EXPORT,
    OE_REQUESTS_SEARCHABLE,
    OE_SCORING_AS_LIST_CREATE,
    OE_SCORING_BY_SCHOOL_CHOICE_READ,
    OE_STUDENT,
    OE_STUDENTS_EXPORT,
    OE_STUDENTS_SEARCHABLE,
    OE_SUBMIT,
    OE_REQUEST_UPDATE_STATUS,
    OE_ENROLL
} from "../const/OpenEnrollmentConst";

/**
 * Data Access for the Echeckin Service
 * @name EcheckinDao
 * @param props
 * @return {null|*}
 */
const OpenEnrollmentDao = (props) => {
    const { action, data, key, locKey, newStatus, oldStatus, params, schoolChoiceKey, schoolId, schoolYearKey, token } =
        props;
    const bearer = `Bearer ${token}`;
    const options = {
        headers: {
            Authorization: bearer,
            "Access-Control-Max-Age": 86400
        },
        withCredentials: true
    };
    switch (action) {
        case "oeActionControls":
            options.method = "GET";
            options.params = params;
            options.url = `${OE_ACTIVE_CONTROLS}/index.json`; // the key is the differentiator
            break;
        case "oeActionControlsByAction":
            options.method = "GET";
            options.params = params;
            options.url = `${OE_ACTION_CONTROLS}/index.json`;
            break;
        case "oeActionControlsByYear":
            options.method = "GET";
            options.url = `${OE_ACTION_CONTROLS}/${schoolYearKey}/index.json`;
            break;
        case "oeActiveDistrictWindowRead":
            options.method = "GET";
            options.url = OE_ACTIVE_DISTRICT_WINDOW;
            break;
        case "oeAllDistrictWindowsByYear":
            options.method = "GET";
            options.url = `${OE_DISTRICT_WINDOWS_BY_YEAR}/${schoolYearKey}/index.json`;
            break;
        case "oeAdminParticipatingSchools":
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.url = `${OE_ADMIN_PARTICIPATING_SCHOOLS}/${schoolYearKey}/index.json`;
            break;
        case "oeAdminSelectedSchoolDetails":
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.url = `${OE_ADMIN_PARTICIPATING_SCHOOL_DETAILS}/${schoolId}/index.json`;
            break;
        case "oeEnroll":
            options.method = "GET";
            options.url = `${OE_ENROLL}/${schoolChoiceKey}/detail.json`;
            break;
        case "oeNonAdminParticipatingSchool":
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.url = `${OE_NON_ADMIN_PARTICIPATING_SCHOOL}/${schoolId}/${schoolYearKey}/index.json`;
            break;
        case "oeEnrollmentPrioritiesRead":
            options.method = "GET";
            options.url = `${OE_ENROLLMENT_PRIORITY_BY_LOCATION}/${locKey}/index.json`;
            break;
        case "oeRequestsSearchableExport":
            options.headers.Accept = "application/csv";
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.responseType = "arraybuffer";
            options.url = OE_REQUESTS_EXPORT;
            break;
        case "oeRequestsSearchableRead":
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.url = OE_REQUESTS_SEARCHABLE;
            break;
        case "oeRequestUpdate":
            options.data = data;
            options.method = "PUT";
            options.url = `${OE_REQUEST}/${key}/detail.json`;
            break;
        case "oeRequestStatusUpdate":
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.url = `${OE_REQUEST_UPDATE_STATUS}/${oldStatus}/${newStatus}/detail.json`;
            break;
        case "oeSchoolChoiceScoresRead":
            options.method = "GET";
            options.url = `${OE_SCORING_BY_SCHOOL_CHOICE_READ}/${schoolChoiceKey}/index.json`;
            break;
        case "oeSchoolChoiceScoresPost":
            options.data = data;
            options.method = "POST";
            options.url = `${OE_SCORING_AS_LIST_CREATE}/${schoolChoiceKey}/index.json`;
            break;
        case "oeSubmitAvailableSlots":
            options.data = data;
            options.method = "PUT";
            options.url = `${OE_SUBMIT}/${schoolId}/index.json`;
            break;
        case "oeStudentsSearchableExport":
            options.headers.Accept = "application/csv";
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.responseType = "arraybuffer";
            options.url = OE_STUDENTS_EXPORT;
            break;
        case "oeStudentsSearchableRead":
            options.method = "GET";
            if (params) {
                options.params = params;
            }
            options.url = OE_STUDENTS_SEARCHABLE;
            break;
        case "oeStudentUpdate":
            options.data = data;
            options.method = "PUT";
            options.url = `${OE_STUDENT}/${key}/detail.json`;
            break;
        default:
            return null;
    }

    return ServiceWrapper.serviceCall({
        options,
        ...props
    });
};

OpenEnrollmentDao.propTypes = {
    action: PropTypes.string.isRequired,
    data: PropTypes.objectOf([PropTypes.object]),
    guid: PropTypes.number,
    locKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    key: PropTypes.number,
    newStatus: PropTypes.string,
    oldStatus: PropTypes.string,
    params: PropTypes.objectOf([PropTypes.object]),
    schoolChoiceKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    schoolYearKey: PropTypes.string,
    schoolId: PropTypes.string,
    token: PropTypes.string.isRequired
};

OpenEnrollmentDao.defaultProps = {
    data: null,
    guid: null,
    key: null,
    locKey: null,
    newStatus: "",
    oldStatus: "",
    params: null,
    schoolChoiceKey: null,
    schoolYearKey: "",
    schoolId: ""
};

export default OpenEnrollmentDao;
