import { SERVICE_HOST } from "../utils/auth/config";

export const OE_SERVICE = `${SERVICE_HOST}/open-enrollment-sb/v0`;

export const OE_ACTION_CONTROLS = `${OE_SERVICE}/action_controller`;
export const OE_ACTIVE_CONTROLS = `${OE_ACTION_CONTROLS}/active/by_differentiator`;
export const OE_ACTIVE_DISTRICT_WINDOW = `${OE_SERVICE}/district_window/active_window/detail.json`;
export const OE_DISTRICT_WINDOWS_BY_YEAR = `${OE_SERVICE}/district_window/school_year_key`; // <schoolYearKey>/index.json

export const OE_ADMIN_PARTICIPATING_SCHOOLS = `${OE_SERVICE}/participating_school/by_school_year_id`; // <schoolYearKey> (active district window key)
export const OE_ADMIN_PARTICIPATING_SCHOOL_DETAILS = `${OE_SERVICE}/available_slots/by_participating_school`; // <participatingSchoolId>/index.json
export const OE_NON_ADMIN_PARTICIPATING_SCHOOL = `${OE_SERVICE}/participating_school/by_location_id`; // <schoolYearKey>/index.json

export const OE_ENROLL = `${OE_SERVICE}/school_choice/enroll_choice`; // /<schoolChoiceId>/detail.json
export const OE_ENROLLMENT_PRIORITY = `${OE_SERVICE}/enrollment_priority`;
export const OE_ENROLLMENT_PRIORITY_BY_LOCATION = `${OE_ENROLLMENT_PRIORITY}/by_location`; // <locationKey>/index.json

export const OE_REQUEST = `${OE_SERVICE}/school_choice`; // /<key>/detail.json
export const OE_REQUESTS_EXPORT = `${OE_SERVICE}/school_choice/search/export.csv`; // index.json`
export const OE_REQUESTS_SEARCHABLE = `${OE_SERVICE}/school_choice/searchable/index.json`;

export const OE_REQUEST_UPDATE_STATUS = `${OE_REQUEST}/updateStatus`; // /<oldStatus>/<newStatus>/detail.json?schoolChoiceId=<schoolChoiceId>&userGuid=<userGuid>

export const OE_SCORING = `${OE_SERVICE}/scoring`;
export const OE_SCORING_BY_SCHOOL_CHOICE_READ = `${OE_SCORING}/school_choice`; //<schoolChoiceId>/index.json`
export const OE_SCORING_AS_LIST_CREATE = `${OE_SCORING}/as_list`; // /<schoolChoiceId>/index.json

export const OE_SUBMIT = `${OE_SERVICE}/available_slots`; // <participatingSchoolId>/index.json
export const OE_STUDENT = `${OE_SERVICE}/student`; // /<key>/detail.json
export const OE_STUDENTS_EXPORT = `${OE_SERVICE}/student/search/export.csv`; // index.json`
export const OE_STUDENTS_SEARCHABLE = `${OE_SERVICE}/student/searchable/index.json`;
