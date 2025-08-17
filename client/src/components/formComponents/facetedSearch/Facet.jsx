import React from "react";
import PropTypes from "prop-types";
import Dropdown from "react-bootstrap/Dropdown";

/**
 * Button Dropdown for a facet field and its available values and counts
 * @name Facet
 * @param {null | func} facetChangeHandler
 * @param {{}} facetField
 * @return {JSX.Element}
 * @constructor
 */
const Facet = ({ facetChangeHandler, facetField, getOptionDisplay }) => {
    const { fieldName, facetEntries } = facetField;
    const options = facetEntries.reduce((result, value) => {
        result.push(`${value.value} (${value.count})`);

        return result;
    }, []);

    const handleMenuItemClick = (index) => {
        if (options[index] === fieldName) {
            facetChangeHandler(fieldName, null);
        } else {
            facetChangeHandler(fieldName, options[index]);
        }
    };

    return (
        <div className="facet ms-2 mt-2">
            <Dropdown className="d-inline mx-2">
                <Dropdown.Toggle id="dropdown-autoclose-true">{getOptionDisplay(fieldName)}</Dropdown.Toggle>
                <Dropdown.Menu
                    style={{
                        maxHeight: "300px",
                        overflowY: "auto"
                    }}
                >
                    {options.map((option, index) => {
                        const uniqueKey = `${fieldName}-item-${index}`;
                        return (
                            <Dropdown.Item href="#" key={uniqueKey} onClick={() => handleMenuItemClick(index)}>
                                {getOptionDisplay(option)}
                            </Dropdown.Item>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

Facet.propTypes = {
    facetChangeHandler: PropTypes.func,
    facetField: PropTypes.objectOf(PropTypes.any).isRequired,
    getOptionDisplay: PropTypes.func.isRequired
};

Facet.defaultProps = {
    facetChangeHandler: null
};

export default Facet;
