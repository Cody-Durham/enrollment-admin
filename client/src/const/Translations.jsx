export const millisecondsToSeconds = (epoch) => {
    return epoch / 1000;
};

export const secondsToDays = (epoch) => {
    return epoch / 86400;
};

export const enumToEnglish = (educationalTrackEnum) => {
    switch (educationalTrackEnum) {
        case "BAYOU_GULCH":
            return "Bayou Gulch";
        case "STROH_RANCH":
            return "Stroh Ranch";
        default:
            return "-";
    }
};

export const enumToString = (actionControlEnum) => {
    switch (actionControlEnum) {
        case "PARENT_REQUEST":
            return "Parent Request";
        case "SCHOOL_AVAILABLE_SLOTS":
            return "School Available Slots";
        case "INTENT_TO_RETURN_FORM":
            return "Intent To Return Form";
        case "SCHOOL_OFFER_PENDING":
            return "School Offer Pending";
        case "ADMIN_OFFER_CONFIRM":
            return "Admin Offer Confirm";
        case "SCHOOL_VIEW_PARENT_OFFER":
            return "School View Parent Offer";
        case "PARENT_OFFER":
            return "Parent Offer";
        case "SCHOOL_FINALIZE":
            return "School Finalize";
        case "SCHOOL_VIEW_ONLY":
            return "School View Only";
        case "SCHOOL_YEAR_EXTENSION_WINDOW":
            return "School Year Extension Window";
        default:
            return "-";
    }
};

export const miniRoundTranslate = (string) => {
    if (string === "ROUND1") {
        return "R1";
    }
    if (string === "ROUND2") {
        return "R2";
    }
};

export const monthObj = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec"
};

export const monthsArr = [
    {
        shortName: "Jan",
        days: 31,
        index: 0,
        percent: 0
    },
    {
        shortName: "Feb",
        days: 28,
        index: 1,
        percent: 0
    },
    {
        shortName: "Mar",
        days: 31,
        index: 2,
        percent: 0
    },
    {
        shortName: "Apr",
        days: 30,
        index: 3,
        percent: 0
    },
    {
        shortName: "May",
        days: 31,
        index: 4,
        percent: 0
    },
    {
        shortName: "Jun",
        days: 30,
        index: 5,
        percent: 0
    },
    {
        shortName: "Jul",
        days: 31,
        index: 6,
        percent: 0
    },
    {
        shortName: "Aug",
        days: 31,
        index: 7,
        percent: 0
    },
    {
        shortName: "Sep",
        days: 30,
        index: 8,
        percent: 0
    },
    {
        shortName: "Oct",
        days: 30,
        index: 9,
        percent: 0
    },
    {
        shortName: "Nov",
        days: 30,
        index: 10,
        percent: 0
    },
    {
        shortName: "Dec",
        days: 31,
        index: 11,
        percent: 0
    }
];
