/**
 *  Handle controlled inputs
 *  The "text" action can handle many different input types including text, textarea, radio, date, email, and select lists
 *  @TODO: Other form types can be added to this (like toggle types)
 *  @name FormReducer
 *  @param {{}} state
 *  @param {{}} action
 *  @return {*}
 */
const FormReducer = (state, action) => {
    switch (action.type) {
        case "reset":
            return action.payload;
        case "text":
            // can also handle textArea, selects, etc.
            return {
                ...state,
                [action.field]: action.payload
            };
        default:
            return state;
    }
};

export default FormReducer;
