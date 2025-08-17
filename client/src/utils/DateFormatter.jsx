/**
 * @name isValidDate
 * @param {*} dateString
 * @returns Bool (true / false)
 * found this on stack overflow
 * https://stackoverflow.com/questions/18758772/how-do-i-validate-a-date-in-this-format-yyyy-mm-dd-using-jquery
 */
export const isValidDate = (dateString) => {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false; // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0, 10) === dateString;
};

export const formatDate = (dateString = null) => {
    if (dateString) {
        const myDate = new Date(dateString.replace(/-/g, "/"));
        const Y = myDate.getFullYear();
        const month = myDate.toLocaleString("default", { month: "long" });
        const dd = myDate.getDate();

        return `${month} ${dd}, ${Y}`;
    }

    return dateString;
};

export const formatDbDate = (dateString = null) => {
    if (dateString) {
        const myDate = new Date(dateString.replace(/-/g, "/"));
        const Y = myDate.getFullYear();
        let month = myDate.getMonth() + 1;
        month = month.toString().padStart(2, "0");
        const dd = myDate.getDate().toString().padStart(2, "0");

        return `${Y}-${month}-${dd}`;
    }

    return dateString;
};

export const formatDateAndTime = (dateString = null) => {
    if (dateString) {
        const myDate = new Date(dateString.replace(/-/g, "/"));
        const Y = myDate.getFullYear();
        const month = myDate.toLocaleString("default", { month: "long" });
        const dd = myDate.getDate();
        let hh = myDate.getHours();
        let meridian = "am";
        if (hh > 12) {
            hh = hh - 12;
            meridian = "pm";
        }

        return `${month} ${dd}, ${Y} at ${hh}${meridian}`;
    }
};

export const formatDateNumbersOnly = (dateString = null) => {
    if (dateString) {
        const myDate = new Date(dateString.replace(/-/g, "/"));
        const Y = myDate.getFullYear();
        const month = (myDate.getMonth() + 1).toString().padStart(2, "0");
        const dd = myDate.getDate().toString().padStart(2, "0");
        let hh = myDate.getHours();
        const ii = myDate.getMinutes().toString().padStart(2, "0");
        let meridian = "am";
        if (hh > 12) {
            hh = hh - 12;
            meridian = "pm";
        }

        return `${month}/${dd}/${Y} ${hh}:${ii} ${meridian}`;
    }
};

export const formatDateAndTimeWithMin = (dateString = null) => {
    if (dateString) {
        const myDate = new Date(dateString.replace(/-/g, "/"));
        const Y = myDate.getFullYear();
        const month = myDate.toLocaleString("default", { month: "long" });
        const dd = myDate.getDate();
        let hh = myDate.getHours();
        const ii = myDate.getMinutes().toString().padStart(2, "0");
        let meridian = "am";
        if (hh > 12) {
            hh = hh - 12;
            meridian = "pm";
        }

        return `${month} ${dd}, ${Y} at ${hh}:${ii} ${meridian}`;
    }
};

export const getToday = () => {
    const myDate = new Date();
    const mm = (myDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = myDate.getDate().toString().padStart(2, "0");

    return `${mm}-${dd}`;
};

export const getSingleYear = () => {
    const myDate = new Date();
    const Y = myDate.getFullYear();

    return `${Y}`;
};

export const getTodayWithYear = () => {
    const myDate = new Date();
    const Y = myDate.getFullYear();
    const mm = (myDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = myDate.getDate().toString().padStart(2, "0");

    return `${Y}-${mm}-${dd}`;
};

export const getTodayWithTime = () => {
    const myDate = new Date();
    const Y = myDate.getFullYear();
    const mm = (myDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = myDate.getDate().toString().padStart(2, "0");
    const hh = myDate.getHours().toString().padStart(2, "0");
    const ii = myDate.getMinutes().toString().padStart(2, "0");
    const ss = myDate.getSeconds().toString().padStart(2, "0");

    return `${Y}-${mm}-${dd} ${hh}:${ii}:${ss}`;
};

/**
 * Return a string in format YYYY-MM-DD HH:ii:ss for submission to db
 * @name getCompleteDateTime
 * @param {string} dateString
 * @return {string}
 */
export const getCompleteDateTime = (dateString) => {
    if (dateString) {
        const newDateArr = dateString.split("T");
        const newDateString = `${newDateArr[0]} ${newDateArr[1].substring(0, 8)}`;
        const myDate = new Date(newDateString.replace(/-/g, "/"));
        const Y = myDate.getFullYear();
        let month = myDate.getMonth() + 1;
        month = month.toString().padStart(2, "0");
        const dd = myDate.getDate().toString().padStart(2, "0");
        const hh = myDate.getHours().toString().padStart(2, "0");
        const ii = myDate.getMinutes().toString().padStart(2, "0");
        const ss = myDate.getSeconds().toString().padStart(2, "0");

        return `${Y}-${month}-${dd} ${hh}:${ii}:${ss}`;
    }

    return dateString;
};

export const getEpoch = (dateString) => {
    if (dateString) {
        return Date.parse(dateString.replace(/-/g, "/"));
    }

    return dateString;
};

export const getDateRangeFromEpoch = (epoch1, epoch2) => {
    const duration = epoch2 / 1000 - epoch1 / 1000;
    const timeLength = duration / 86400;
    const numberOfDays = Math.ceil(timeLength);

    return `${numberOfDays} days`;
};

export const getDateFromEpoch = (epoch) => {
    const myDate = new Date(0);
    myDate.setUTCSeconds(epoch);
    const Y = myDate.getFullYear();
    const mm = (myDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = myDate.getDate().toString().padStart(2, "0");
    const hh = myDate.getHours().toString().padStart(2, "0");
    const ii = myDate.getMinutes().toString().padStart(2, "0");
    const ss = myDate.getSeconds().toString().padStart(2, "0");

    return `${Y}-${mm}-${dd}@${hh}:${ii}:${ss}`;
};
