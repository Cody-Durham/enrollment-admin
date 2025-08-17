export const stringGradeOrdinal = {
    PRE: -4,
    K_HALF_AM: -3,
    K_HALF_PM: -2,
    K_FULL: -1,
    KINDERGARTEN: 0,
    K: 1,
    FIRST: 2,
    SECOND: 3,
    THIRD: 4,
    FOURTH: 5,
    FIFTH: 6,
    SIXTH: 7,
    SEVENTH: 8,
    EIGHTH: 9,
    NINTH: 10,
    TENTH: 11,
    ELEVENTH: 12,
    TWELFTH: 13
};

export const gradeTrans = (grade) => {
    if (["K", "K_FULL", "K_HALF", "K_HALF_AM", "K_HALF_PM"].includes(grade)) {
        return "KINDERGARTEN";
    }

    return grade;
};

/**
 * School Choice Management
 */

/* @kinderObj {[]} */
export const kinderObj = [
    { value: "K_HALF_AM", display: "Half Day - AM" },
    { value: "K_HALF_PM", display: "Half Day - PM" },
    { value: "K_FULL", display: "Full Day" }
];

/* @languageObj {[]} */
export const languageObj = [
    { value: "FRENCH", display: "French" },
    { value: "MANDARIN", display: "Mandarin" },
    { value: "SPANISH", display: "Spanish" }
];

/* @statusObj {[]} */
export const statusObj = [
    { value: "ACCEPT_OFFER", display: "Accepted Offer" },
    { value: "CANCELLED_REQUEST", display: "Cancelled Request" },
    { value: "CHANGED_ENROLLMENT", display: "Changed Enrollment" },
    { value: "CHOICE_INCOMPLETE", display: "Choice Incomplete" },
    { value: "DENY_OFFER", display: "Denied Offer" },
    { value: "DENY_REQUEST", display: "Deny Request" },
    { value: "ENROLLED", display: "Enrolled" },
    { value: "MAKE_OFFER", display: "Make Offer" },
    { value: "MAKE_OFFER_PENDING", display: "Make Pending Offer" },
    { value: "NO_RESPONSE", display: "No Response" },
    { value: "REQUEST", display: "Request Made" },
    { value: "WAIT_LIST", display: "On Wait List" }
    // { value: "UNENROLLED", display: "Unenrolled" } // some confusion about whether or not this enum has been implemented on the BE
];

/**
 * Return an English version of a status
 * @name trans
 * @param {string} stat
 * @return {string}
 */
export const trans = (stat) => {
    switch (stat) {
        case "ACCEPT_OFFER":
            return "Accepted Offer";
        case "CANCELLED_REQUEST":
            return "Cancelled Request";
        case "CHANGED_ENROLLMENT":
            return "Changed Enrollment";
        case "DENY_OFFER":
            return "Denied Offer";
        case "DENY_REQUEST":
            return "Deny Request";
        case "ENROLLED":
            return "Enrolled";
        case "K_FULL":
            return "Full Day Kindergarten";
        case "K_HALF_AM":
            return "Half Day Kindergarten - AM";
        case "K_HALF_PM":
            return "Half Day Kindergarten - PM";
        case "FRENCH":
            return "French";
        case "MAKE_OFFER":
            return "Offer Made";
        case "MAKE_OFFER_PENDING":
            return "Offer Pending";
        case "MANDARIN":
            return "Mandarin";
        case "NO_RESPONSE":
            return "No Response";
        case "REQUEST":
            return "Request Made";
        case "SPANISH":
            return "Spanish";
        case "WAITLIST":
            return "On Waitlist";
        case "WAIT_LIST":
            return "On Wait List";
        default:
            return stat;
    }
};

/**
 * Return an readable version of the elements in an array
 * @name getReadableStatus
 * @param {[]} stat
 * @return {string}
 */
export const getReadableStatus = (stat) => {
    const statArr = stat?.split(",");
    if (statArr?.length > 1) {
        const revised = statArr.map((stat) => trans(stat));
        return revised.join(", ");
    } else {
        return trans(stat);
    }
};
