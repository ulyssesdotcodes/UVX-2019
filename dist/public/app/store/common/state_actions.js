"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var state_types_1 = require("./state_types");
function updateState(state) {
    return {
        type: state_types_1.UPDATE_SHOW_STATE,
        payload: state
    };
}
exports.updateState = updateState;
//# sourceMappingURL=state_actions.js.map