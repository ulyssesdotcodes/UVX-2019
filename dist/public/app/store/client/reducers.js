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
var Option_1 = require("fp-ts/lib/Option");
var state_types_1 = require("../common/state_types");
var initialState = {
    activeVote: Option_1.none,
    activeCues: []
};
function clientReducer(state, action) {
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case state_types_1.UPDATE_SHOW_STATE: {
            return __assign({}, state, action.payload, { activeVote: action.payload.activeVote._tag === "None" ?
                    Option_1.none :
                    Option_1.some(action.payload.activeVote.value) });
        }
        default:
            return state;
    }
}
exports.clientReducer = clientReducer;
//# sourceMappingURL=reducers.js.map