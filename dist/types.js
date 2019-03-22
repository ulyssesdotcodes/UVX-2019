"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var monocle_ts_1 = require("monocle-ts");
var Option_1 = require("fp-ts/lib/Option");
exports.VOTE_DURATION = 45;
var isFilmVote = function (v) { return v.type === "film"; };
var isShowVote = function (v) { return v.type === "show"; };
exports.filmVote = monocle_ts_1.Prism.fromRefinement(isFilmVote);
exports.showVote = monocle_ts_1.Prism.fromRefinement(isShowVote);
//     hasOptionAPrism.composeLens(Lens.fromPath("optionA"));
function options(vote) {
    var optionA = vote.optionA ?
        Option_1.some([vote.optionA, "optionA"]) :
        Option_1.none;
    var optionB = vote.optionB ?
        Option_1.some([vote.optionB, "optionB"]) :
        Option_1.none;
    var optionC = vote.optionC ?
        Option_1.some([vote.optionC, "optionC"]) :
        Option_1.none;
    return [optionA, optionB, optionC].filter(function (v) { return v.isSome(); }).map(function (v) { return v.getOrElse(["", "optionA"]); });
}
exports.options = options;
function voteChoice(vote, vc) {
    switch (vc) {
        case "optionA":
            return vote.optionA ?
                Option_1.some(vote.optionA)
                : Option_1.none;
        case "optionB":
            return vote.optionB ?
                Option_1.some(vote.optionB)
                : Option_1.none;
        case "optionC":
            return vote.optionC ?
                Option_1.some(vote.optionC)
                : Option_1.none;
        default: return Option_1.none;
    }
}
exports.voteChoice = voteChoice;
function voteMovie(vote, vc) {
    switch (vc) {
        case "optionA":
            return vote.optionAMovie;
        case "optionB":
            return vote.optionBMovie;
        case "optionC":
            return vote.optionCMovie;
    }
}
exports.voteMovie = voteMovie;
exports.voteMap = monocle_ts_1.Lens.fromProp()("voteMap");
exports.activeVoteVote = monocle_ts_1.Lens.fromProp()("vote");
exports.blackout = monocle_ts_1.Lens.fromProp()("blackout");
exports.paused = monocle_ts_1.Lens.fromProp()("paused");
exports.activeCues = monocle_ts_1.Lens.fromProp()("activeCues");
exports.activeVote = monocle_ts_1.Optional.fromOptionProp()("activeVote");
exports.activeVoteLens = monocle_ts_1.Lens.fromProp()("activeVote");
exports.activeMovie = monocle_ts_1.Optional.fromOptionProp()("activeMovie");
exports.activeMovieLens = monocle_ts_1.Lens.fromProp()("activeMovie");
exports.voteResult = monocle_ts_1.Optional.fromOptionProp()("voteResult");
exports.voteResultLens = monocle_ts_1.Lens.fromProp()("voteResult");
exports.defaultShowState = { blackout: false, paused: true, activeVote: Option_1.none, activeCues: [], activeMovie: Option_1.none, voteResult: Option_1.none, filmVotes: [], showVotes: [] };
function deserializeOption(a) {
    return (a._tag === "None" ? Option_1.none : Option_1.some(a.value));
}
exports.deserializeOption = deserializeOption;
//# sourceMappingURL=types.js.map