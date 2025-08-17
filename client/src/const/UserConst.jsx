import { SERVICE_HOST } from "../utils/auth/config";

export const USER_SERVICE = `${SERVICE_HOST}/user/v1`;
export const USER_V0 = `${SERVICE_HOST}/user/v0`;
export const USER_SCHOOL_YEAR = `${USER_SERVICE}/schoolyear`; // /<key>/detail.json
export const USER_ACTIVE_SCHOOL_YEAR = `${USER_SCHOOL_YEAR}/active/detail.json`;
export const USER_ATTRIBUTES_UPDATE = `${USER_SERVICE}/attribute`; // /<guid>/index.json
export const USER_INSTRUCTIONAL_AREA = `${USER_SERVICE}/instructionalarea`; // /<guid>/index.json
export const USER_LOCATION_SEARCHABLE_GET = `${USER_SERVICE}/location/searchable/index.json`;
export const USER_LOCATION_BY_KEY = `${USER_SERVICE}/location`; // /<key>/detail.json
export const USER_PERMISSIONS = `${USER_V0}/permissions`; // /<guid>/<applicationType>/detail.json
export const USER_SYNC = `${USER_SERVICE}/sync`; // /<username>/details.json
export const USER_SUMMARIES = `${USER_SERVICE}/users/summary.json`;
export const USER_DETAILS = `${USER_SERVICE}/userDetails/index.json`;
export const USER_ACCESS_CONTROLS = `${USER_V0}/permissions/accessControls`; // /<userGuid>/<targetGuid>/detail.json
