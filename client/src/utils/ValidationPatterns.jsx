/**
 * Basic regular expression patterns for specific input type validations
 * @name ValidationPatterns
 * @type {{phone: RegExp, email: RegExp, ssn: RegExp}}
 */
const ValidationPatterns = {
    email: /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})]?$)/i,
    phoneNumber: /^[2-9]\d{2}-\d{3}-\d{4}((X){0,1}([0-9]){1,10})?$/,
    // phone: /^[0-9\b]+$/,
    phone: /^\d{10}$/,
    socialSecurityNumber: /^\d{9}$/,
    ssn: /^[0-9\b]+$/,
    // eslint-disable-next-line
    url: /((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%\/\&=?\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)/gi,
    digitOnly: /^[0-9\b\d]+$/,
    numeric: /^(0|[1-9]\d*)?(\.\d+)?(?<=\d)$/
};

export default ValidationPatterns;
