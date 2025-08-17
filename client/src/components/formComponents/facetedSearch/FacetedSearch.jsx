import React, { useState } from "react";
import PropTypes from "prop-types";
import Facet from "./Facet";
import ActionButton from "../../formInputs/buttons/ActionButton";

import "../../../styles/FacetedSearch.scss";

/**
 * Return a Faceted Search Form containing a Keyword Search, optional Facets, and optional Export button
 * @name FacetedSearch
 * @param {func|null} exportCsvHandler
 * @param {[]} facetFields
 * @param {bool} includeKeyword
 * @param {{}} params
 * @param {[]} selectedFacets
 * @param {null|func} setPageNum
 * @param {func|null} setParams
 * @param {func|null} setSearchString
 * @param {func|null} setSelectedFacets
 * @return {JSX.Element}
 */
const FacetedSearch = ({
    exportCsvHandler,
    facetFields,
    includeKeyword,
    params,
    selectedFacets,
    setPageNum,
    setParams,
    setSearchString,
    setSelectedFacets
}) => {
    const [keyword, setKeyword] = useState("");

    /**
     * Retrieve the searchString and trigger the search
     * @param {{}} e
     */
    const getKeyword = (e) => {
        setKeyword(e.target.value);
    };

    const getOptionDisplay = (option) => {
        const display = option.split(/([A-Z][a-z]+)/).filter((e) => {
            return e;
        });
        let newDisplay = display.join(" ");
        newDisplay = `${newDisplay.charAt(0).toUpperCase()}${newDisplay.slice(1)}`;
        // a one-off to capitalize each letter of IEP
        switch (option) {
            case "schoolChoiceSchoolName":
                newDisplay = "School Choice";
                break;
            case "kinderChoiceList":
                newDisplay = "Kinder Choice";
                break;
            case "languageChoiceList":
                newDisplay = "Language Choice";
                break;
            case "statusDisplayName":
                newDisplay = "Status";
                break;
            case "studentIepStatus":
                newDisplay = "Student IEP Status";
                break;
            case "studentSchoolName":
                newDisplay = "Student Current School Name";
                break;
            default:
                break;
        }

        return (
            <span className="text-truncate" style={{ maxWidth: "480px" }}>
                {newDisplay}
            </span>
        );
    };

    /**
     * Retrieve the facet name and value, set params, and trigger the search
     * @name getParams
     * @param {string} field
     * @param {string} value
     */
    const getParams = (field, value) => {
        // this gets called only on a change to the search parameters
        // therefore, reset the pagination
        setPageNum(1);
        const alteredValue = value ? value.split(" (") : null;
        const truValue = alteredValue ? alteredValue[0] : null;
        const myParams = params;
        myParams[field] = truValue;
        if (truValue) {
            const mySelectedFacets = selectedFacets;
            mySelectedFacets.push({ fieldName: field, fieldValue: truValue });
            setSelectedFacets(mySelectedFacets);
        }
        const newParams = {};
        Object.keys(myParams).forEach((key) => {
            if (myParams[key]) {
                newParams[key] = myParams[key];
            }
        });
        // this will trigger a new search
        setParams(newParams);
    };

    /**
     * Retrieve the keyword input value, set the searchString param, and reset the pageNum
     * @name getSearchString
     */
    const getSearchString = () => {
        setSearchString(keyword);
        if (setPageNum) {
            setPageNum(1);
        }
    };

    /**
     * Traverse the selected facet - from "x" to icon to button to find the name attribute
     * @name getTargetName
     * @param {{}} target
     * @return {null|string}
     */
    const getTargetName = (target) => {
        if (target.name) {
            return target.name;
        }
        const { parentElement } = target;
        if (parentElement) {
            if (parentElement.name) {
                return parentElement.name;
            }

            return parentElement.parentElement.name;
        }

        return null;
    };

    /**
     * Identify a previously-selected facet and remove it
     * @name removeFilter
     * @param e
     */
    const removeFilter = (e) => {
        const { target } = e;
        const filterName = getTargetName(target);
        const myFilters = selectedFacets.reduce((result, field) => {
            if (filterName !== field.fieldName) {
                result.push({
                    fieldName: field.fieldName,
                    fieldValue: field.fieldValue
                });
            }

            return result;
        }, []);

        setSelectedFacets(myFilters);
        getParams(filterName, null);
    };

    return (
        <>
            <div className="form-inline mb-1 mt-3 ms-3 pe-3 d-flex justify-content-between">
                {includeKeyword && (
                    <div className="keyword-container">
                        <div className="input-group">
                            <input
                                aria-label="Keyword Search"
                                className="form-control keyword-search"
                                id="keywordSearch"
                                name="keywordSearch"
                                onChange={getKeyword}
                                placeholder="Enter Keyword Here"
                                type="text"
                                value={keyword}
                            />
                            <div className="clear-container">
                                {keyword.length > 0 && (
                                    <button
                                        aria-label="Keyword Search Reset Button"
                                        className="btn bg-transparent btn-sm keyword-clear"
                                        id="keywordReset"
                                        name="keywordReset"
                                        onClick={() => {
                                            setKeyword("");
                                            setSearchString("");
                                        }}
                                        type="button"
                                    >
                                        <span>&times;</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <ActionButton
                            aria-label="Search"
                            className="action-button-150 mt-1"
                            id="search"
                            label="Search"
                            name="search"
                            onClick={getSearchString}
                        />
                    </div>
                )}
                {exportCsvHandler && (
                    <ActionButton
                        aria-label="Export CSV"
                        className="action-button-200 mt-1"
                        label="Export CSV"
                        name="export"
                        onClick={exportCsvHandler}
                    />
                )}
            </div>
            <div className="flex-wrap form-inline mt-3">
                {facetFields.map((facetField, index) => {
                    const facetKey = `facet-${index}`;
                    // if a facet has only one option, no need to show it
                    return facetField.facetEntries.length > 1 ? (
                        <Facet
                            facetChangeHandler={getParams}
                            facetField={facetField}
                            getOptionDisplay={getOptionDisplay}
                            key={facetKey}
                        />
                    ) : null;
                })}
            </div>
            {selectedFacets ? (
                <div className="form-inline">
                    {selectedFacets.map((field, index) => {
                        const facetKey = `facet-button-${index}`;
                        // list out all previously selected facets as a removable button
                        return (
                            <button
                                aria-label="remove filter"
                                className="btn btn-warning m-3"
                                key={facetKey}
                                onClick={removeFilter}
                                name={field.fieldName}
                            >
                                <span style={{ fontStyle: "italic" }}>{getOptionDisplay(field.fieldName)}</span> |{" "}
                                {field.fieldValue}
                                <span className="ms-2">
                                    <i className="bi bi-x-circle" onClick={removeFilter} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </>
    );
};

/**
 * Add changeable params to the static params
 * @name getRequestParams
 * @param {{}} params
 * @param {{}} requests
 * @type {function(*): any}
 */
FacetedSearch.getRequestParams = (params, requests) => {
    const myParams = requests;
    Object.keys(params).forEach((key) => {
        myParams[key] = params[key];
    });

    return myParams;
};

FacetedSearch.propTypes = {
    exportCsvHandler: PropTypes.func,
    facetFields: PropTypes.instanceOf(Array),
    includeKeyword: PropTypes.bool,
    params: PropTypes.objectOf(PropTypes.any),
    selectedFacets: PropTypes.instanceOf(Array),
    setPageNum: PropTypes.func,
    setParams: PropTypes.func,
    setSearchString: PropTypes.func,
    setSelectedFacets: PropTypes.func
};

FacetedSearch.defaultProps = {
    exportCsvHandler: null,
    facetFields: [],
    includeKeyword: false,
    params: {},
    selectedFacets: [],
    setPageNum: null,
    setParams: null,
    setSearchString: null,
    setSelectedFacets: null
};

export default FacetedSearch;
