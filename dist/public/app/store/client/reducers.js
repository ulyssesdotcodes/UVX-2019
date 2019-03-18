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
var websocket_types_1 = require("../common/websocket_types");
var initialState = {
    vote: Option_1.none,
    voteChoice: Option_1.none
};
function clientReducer(state, action) {
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case websocket_types_1.WEBSOCKET_MESSAGE:
            return __assign({}, state, { vote: Option_1.some(JSON.parse(action.payload.event.data)) });
        case types_1.VOTE:
        default:
            return state;
    }
}
exports.clientReducer = clientReducer;
//# sourceMappingURL=reducers.js.map