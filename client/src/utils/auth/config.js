export const DCSD_COOKIE = "dcsdToken";
// dynamic file location
export const ECHECKIN_SCHOOL_FORMS_DOMAIN =
    process.env.NODE_ENV !== "production" ? "https://twpp-eval.dcsdk12.org" : "https://eval.dcsdk12.org";

export const GUARDIAN_DASHBOARD =
    process.env.NODE_ENV !== "production" ? "https://twpp-engaged.dcsdk12.org" : "https://engaged.dcsdk12.org";

export const EMPLOYEE_DASHBOARD =
    process.env.NODE_ENV !== "production" ? "https://dev-portal.dcsdk12.org" : "https://employee.dcsdk12.org";

export const EVALUATION_SITE =
    process.env.NODE_ENV !== "production" ? "https://dev-evaluation.dcsdk12.org" : "https://evaluation.dcsdk12.org";

export const EXPIRY_BUFFER_MILLI = 60000;
// dynamic service host
export const SERVICE_HOST =
    process.env.NODE_ENV !== "production" ? "https://preprod-service.dcsdk12.org" : "https://prod-service.dcsdk12.org";
export const SAML_LOGOUT_URL = `${SERVICE_HOST}/auth/saml/logout`;
export const SPRING_COOKIE = "JESSIONID";
export const START_SESSION_URL = `${SERVICE_HOST}/auth/v1/auth/session`;
// how often to check if token is expired
export const TOKEN_EXPIRY_CHECK_MILLI = 60000;
export const TOKEN_URL = `${SERVICE_HOST}/auth/v1/auth/token`;
export const TOKEN_URL_DEV = `${SERVICE_HOST}/auth-token/v1/auth`;

// Google Analytics tracking ID
export const TRACKING_ID = "UA-168847218-1";
