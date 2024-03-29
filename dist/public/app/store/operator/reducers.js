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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Option_1 = require("fp-ts/lib/Option");
var state_types_1 = require("../common/state_types");
var types_1 = require("../../../../types");
var fpmap = __importStar(require("fp-ts/lib/StrMap"));
var initialState = {
    filmVotes: [],
    showVotes: [],
    voteResults: { latest: Option_1.none, latestShow: Option_1.none, latestFilm: Option_1.none, all: new fpmap.StrMap({}) },
    activeVote: Option_1.none,
    paused: Option_1.none,
    activeMovie: Option_1.none,
    cues: [],
    activeCues: []
};
function operatorReducer(state, action) {
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case state_types_1.UPDATE_SHOW_STATE: {
            return __assign({}, state, action.payload, { activeVote: types_1.deserializeOption(action.payload.activeVote) }, { activeMovie: types_1.deserializeOption(action.payload.activeMovie) }, { paused: types_1.deserializeOption(action.payload.paused) }, { voteResults: {
                    latest: types_1.deserializeOption(action.payload.voteResults.latest),
                    latestShow: types_1.deserializeOption(action.payload.voteResults.latestShow),
                    latestFilm: types_1.deserializeOption(action.payload.voteResults.latestFilm),
                    all: new fpmap.StrMap(action.payload.voteResults.all.value)
                } });
        }
        default:
            return state;
    }
}
exports.operatorReducer = operatorReducer;
//# sourceMappingURL=reducers.js.map