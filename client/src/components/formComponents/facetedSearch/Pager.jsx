import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Pagination from "react-bootstrap/Pagination";

/**
 * Pagination Buttons
 * @name Pager
 * @param {func} setPageNum
 * @param {{}} facetPagination
 * @return {JSX.Element}
 */
const Pager = ({ facetPagination, setPageNum }) => {
    const [activePage, setActivePage] = useState(1);
    const [maxOrdinal, setMaxOrdinal] = useState(1);
    const [ordinal, setOrdinal] = useState(1);
    const [pages, setPages] = useState([]);
    const [pagesToDisplay, setPagesToDisplay] = useState(0);
    const [recordStart, setRecordStart] = useState(1);
    const [recordEnd, setRecordEnd] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    /**
     * Display the appropriate ordinal, i.e., 1st, 2cd, 3rd, 11th, 21st, etc.
     * @name getOrdinalSuffix
     * @param {string} numStr
     * @return {string}
     */
    const getOrdinalSuffix = (numStr) => {
        if (numStr) {
            if (["11", "12", "13"].includes(numStr.substring(numStr.length - 2))) {
                return `${numStr}th`;
            } else {
                if (numStr.substring(numStr.length - 1) === "1") {
                    return `${numStr}st`;
                } else if (numStr.substring(numStr.length - 1) === "2") {
                    return `${numStr}nd`;
                } else if (numStr.substring(numStr.length - 1) === "3") {
                    return `${numStr}rd`;
                } else {
                    return `${numStr}th`;
                }
            }
        }
    };

    /**
     * Step through pagination
     * @name pageStep
     * @param {string} action
     */
    const pageStep = (action) => {
        if (action === "next") {
            if (activePage % pagesToDisplay === 0) {
                setOrdinal(ordinal + 1);
            }
            setActivePage(activePage + 1);
        } else {
            if ((activePage - 1) % pagesToDisplay === 0) {
                setOrdinal(ordinal - 1);
            }
            setActivePage(activePage - 1);
        }
    };

    /**
     * onLoad, set up the pagination values so that we can navigate either by direct click or with next or last
     */
    useEffect(() => {
        if (facetPagination) {
            const { currentPageNumber, numberResultsOnPage, totalNumberPages, totalResults } = facetPagination;
            let blocksToDisplay = 0;
            if (totalNumberPages > 4) {
                blocksToDisplay = 5;
                setPagesToDisplay(5);
            } else {
                blocksToDisplay = totalNumberPages;
                setPagesToDisplay(totalNumberPages);
            }
            setActivePage(currentPageNumber);
            setMaxOrdinal(Math.ceil(totalNumberPages / blocksToDisplay));
            setRecordStart(currentPageNumber * numberResultsOnPage - numberResultsOnPage + 1);
            setRecordEnd(currentPageNumber * numberResultsOnPage);
            setTotalPages(totalNumberPages);
            setTotalRecords(totalResults);
            if (currentPageNumber === 1) {
                setOrdinal(1);
            }
            if (currentPageNumber === totalNumberPages) {
                setRecordStart(totalResults - numberResultsOnPage + 1);
                setRecordEnd(totalResults);
            }
        }
    }, [facetPagination]);

    /**
     * Piece together the available page data
     */
    useEffect(() => {
        if (ordinal > 0) {
            const pageArr = [];
            const end = pagesToDisplay * ordinal;
            const start = end - pagesToDisplay + 1;
            if (start > 0) {
                for (let i = start; i <= end; i++) {
                    if (i === activePage) {
                        pageArr.push({ page: i, active: true });
                    } else if (i <= totalPages) {
                        pageArr.push({ page: i, active: false });
                    }
                }
                setPages(pageArr);
                setPageNum(activePage);
            }
        }
    }, [activePage, ordinal, pagesToDisplay, setPageNum, totalPages]);

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <div style={{ width: "33%" }} />
            <Pagination>
                {activePage > pagesToDisplay && (
                    <Pagination.First
                        onClick={() => {
                            setActivePage(1);
                            setOrdinal(1);
                        }}
                    />
                )}
                {ordinal > 1 && <Pagination.Prev onClick={() => pageStep("prev")} />}
                {pages.map((pageObj, index) => {
                    const uniqueKey = `page-button-${index}`;
                    return (
                        <Pagination.Item
                            active={pageObj.active}
                            key={uniqueKey}
                            onClick={() => setActivePage(pageObj.page)}
                        >
                            {pageObj.page}
                        </Pagination.Item>
                    );
                })}
                {ordinal < maxOrdinal && (
                    <>
                        <Pagination.Next
                            onClick={() => {
                                pageStep("next");
                            }}
                        />
                        <Pagination.Last
                            onClick={() => {
                                setActivePage(totalPages);
                                setOrdinal(maxOrdinal);
                            }}
                        />
                    </>
                )}
            </Pagination>
            <div className="showing-records">
                Displaying <b>{getOrdinalSuffix(recordStart.toString())}</b> result through{" "}
                <b>{getOrdinalSuffix(recordEnd.toString())}</b> result of <b>{totalRecords}</b> total results
            </div>
        </div>
    );
};

Pager.propTypes = {
    facetPagination: PropTypes.oneOfType([PropTypes.object]).isRequired,
    setPageNum: PropTypes.func.isRequired
};

export default Pager;
