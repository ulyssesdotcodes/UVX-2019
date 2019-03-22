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
var Option_1 = require("fp-ts/lib/Option");
var state_types_1 = require("../common/state_types");
var types_2 = require("../../../../types");
var initialState = {
    filmVotes: [],
    showVotes: [],
    voteResults: new Map(),
    activeVote: Option_1.none
};
function operatorReducer(state, action) {
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case state_types_1.UPDATE_SHOW_STATE: {
            return __assign({}, state, action.payload, { voteResults: types_2.deserializeOption(action.payload.voteResult)
                    .map(function (vr) { return state.voteResults.set(vr.voteId, vr.name); })
                    .getOrElse(state.voteResults)
            }, { activeVote: types_2.deserializeOption(action.payload.activeVote) });
        }
        case types_1.CUE_VOTE:
        case types_1.CUE_BATCH:
        default:
            return state;
    }
}
exports.operatorReducer = operatorReducer;
//# sourceMappingURL=reducers.js.map