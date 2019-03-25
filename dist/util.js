"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Option_1 = require("fp-ts/lib/Option");
exports.VOTE_DURATION = process.execPath.includes("node") ? 10 : 45;
exports.defaultShowState = {
    blackout: false,
    paused: !process.execPath.includes("node"),
    activeVote: Option_1.none,
    activeCues: [],
    activeMovie: Option_1.none,
    voteResult: Option_1.none,
    filmVotes: [],
    showVotes: []
};
//# sourceMappingURL=util.js.map