import axios from "axios";
import { toast } from "react-toastify";
// import T from "../components/translations/Translations";

/**
 * Uses axios - method, url, event listeners, etc. are passed into the options
 * param as an object.
 * @name ServiceWrapper
 * @param {{}} options
 * @return {Promise}
 */
const ServiceWrapper = (options) => {
    return new Promise((resolve, reject) => {
        axios(options)
            .then((response) => {
                if (ServiceWrapper.checkStatus(response)) {
                    resolve(response);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

/**
 * Do we have a workable status? If not, throw an error with the status text
 * @name checkStatus
 * @static
 * @param {{}} response
 * @return {{}} response
 * @throws {Error} error
 */
ServiceWrapper.checkStatus = (response) => {
    // Success status is any 200s response
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    throw new Error(response);
};

/**
 * @TODO: according to Axios docs, error.response holds some information
 * Detect the type of error and return the appropriate message
 * @name errorHandler
 * @static
 * @param {{}|string|null} error
 * @return {string|*}
 */
ServiceWrapper.errorHandler = (error) => {
    /* eslint-disable no-unused-vars */
    const { exception, message, path, request, response } = error;
    if (response) {
        const { data, headers, status } = response;
        return `${status} - ${data}`;
    }
    /* eslint-enable no-unused-vars */
    if (request) {
        return request;
    }
    if (message) {
        return message;
    }
    // const eErr = error.error ? error.error : "";
    // const eExc = exception ? `\n${exception}` : "";
    // const eMess = message ? `\n${message}` : "";
    // const ePath = path ? `\n${path}` : "";
    // if (status) {
    //     return `${status} - ${eErr} ${eExc} ${eMess} ${ePath}`;
    // }

    return error;
};

/**
 * Convert response headers into an array
 * @name responseHeadersAsArray
 * @static
 * @param {{}} response
 * @return {[]} headers
 */
ServiceWrapper.responseHeadersAsArray = (response) => {
    const headers = {};
    const keyValues = [...response.headers.entries()];
    keyValues.forEach(([key, val]) => {
        headers[key] = val;
    });

    return headers;
};

/**
 * Perform CRUD operations with an API
 * @name serviceCall
 * @static
 * @param {string} actionOverride
 * @param {{}} options
 * @param {bool} retrieveAllFlag
 * @param {func} setLoader
 * @param {func} setResults
 * @param {string} subject
 * @return {*}
 */
ServiceWrapper.serviceCall = ({ actionOverride, options, retrieveAllFlag, setLoader, setResults, subject }) => {
    let action = "update";
    switch (options.method) {
        case "DELETE":
            action = "delete";
            // action = T({ key: "Toast_27" });
            break;
        case "POST":
            action = "create";
            // action = T({ key: "Toast_28" });
            break;
        case "PUT":
            action = "update";
            // action = T({ key: "Toast_29" });
            break;
        default:
            // method = GET
            action = "retrieve";
            // action = T({ key: "Toast_30" });
            break;
    }
    action = actionOverride || action;

    return ServiceWrapper(options)
        .then((response) => {
            if (setResults) {
                const { payload } = response.data;
                if (Array.isArray(payload) && !retrieveAllFlag) {
                    setResults(payload[0]);
                } else {
                    setResults(payload);
                }
            }
            if (setLoader) {
                setLoader(false);
            }
            if (subject) {
                // const myMessageAction = T({ key: action });
                // const myMessageSubject = T({ key: subject });
                // const completeMessage = `${myMessageAction} ${myMessageSubject}`;
                toast.success(`Successfully ${action}d the ${subject}`, {
                    autoClose: 10000
                });

                // toast.success(`${action} ${subject}`, { autoClose: 10000 });
            }

            return response;
        })
        .catch((error) => {
            if (subject) {
                toast.error(ServiceWrapper.errorHandler(error));
            }
        });
};

export default ServiceWrapper;
