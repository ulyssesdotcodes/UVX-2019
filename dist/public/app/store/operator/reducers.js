"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var state_types_1 = require("../common/state_types");
var initialState = {
    filmVotes: [],
    showVotes: [],
    voteMap: {},
};
function operatorReducer(state, action) {
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case state_types_1.UPDATE_SHOW_STATE: {
            console.log(action.payload);
            return __assign({}, state, action.payload);
        }
        case types_1.CUE_VOTE:
        case types_1.CUE_BATCH:
        default:
            return state;
    }
}
exports.operatorReducer = operatorReducer;
//# sourceMappingURL=reducers.js.map