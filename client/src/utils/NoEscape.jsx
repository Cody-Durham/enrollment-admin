import React, { useEffect } from "react";

/**
 * @name NoEscape
 * @returns false
 * This deactivates the escape key
 * so modals will not be able to close with key press ("Escape")
 */
const NoEscape = () => {
    useEffect(() => {
        const escapeNoClose = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        document.addEventListener("keydown", escapeNoClose);

        return () => {
            document.addEventListener("keydown", escapeNoClose);
        };
    });

    // Without this.. the react import does not get used???
    // WTF?
    return <div>&nbsp;</div>;
};

export default NoEscape;
