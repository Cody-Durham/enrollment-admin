import React from "react";
import WindowAndPermissionDialog from "./modals/WindowAndPermissionDialog";

/**
 * @returns a simple looking dialog to tell the user they dont have access to this page
 */
const NotFound = () => {
    return (
        <>
            <WindowAndPermissionDialog
                id="out-of-bounds"
                open="out-of-bounds"
                changeButtonText="Thinglkjl;j;lj;lkj"
                sorryTitle="Page Not Found"
                sorryMessage="Sorry, but this resource is not available."
            />
            <hr className="mt-5" />
        </>
    );
};

export default NotFound;
