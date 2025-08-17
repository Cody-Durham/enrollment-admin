export const yearsArray = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);
export const currentYear = new Date().getFullYear();

export const leapYear = (year) => {
    const myYear = parseInt(year, 10);
    return (myYear % 4 === 0 && myYear % 100 !== 0) || myYear % 400 === 0;
};
