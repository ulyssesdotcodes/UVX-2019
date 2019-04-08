"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Option_1 = require("fp-ts/lib/Option");
var StrMap_1 = require("fp-ts/lib/StrMap");
exports.VOTE_DURATION = process.execPath.includes("node") ? 10 : 45;
exports.defaultShowState = {
    assetPath: ".",
    blackout: false,
    paused: process.execPath.includes("node") ? Option_1.none : Option_1.some(new Date().getTime()),
    activeVote: Option_1.none,
    activeCues: [],
    activeMovie: Option_1.none,
    voteResults: { latest: Option_1.none, latestFilm: Option_1.none, latestShow: Option_1.some("OPEN"), all: new StrMap_1.StrMap({ "OPEN": "optionA" }) },
    filmVotes: [],
    showVotes: [],
    cues: []
};
function createActiveVote(vote) {
    return {
        vote: vote,
        finishTime: new Date().getTime() + exports.VOTE_DURATION * 1000,
        voteMap: new StrMap_1.StrMap({})
    };
}
exports.createActiveVote = createActiveVote;
//# sourceMappingURL=util.js.map