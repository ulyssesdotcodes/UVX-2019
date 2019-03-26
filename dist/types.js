"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var monocle_ts_1 = require("monocle-ts");
var Option_1 = require("fp-ts/lib/Option");
var function_1 = require("fp-ts/lib/function");
var fpmap = __importStar(require("fp-ts/lib/StrMap"));
var Array_1 = require("fp-ts/lib/Array");
var isFilmVote = function (v) { return v.type === "film"; };
var isShowVote = function (v) { return v.type === "show"; };
exports.filmVote = monocle_ts_1.Prism.fromRefinement(isFilmVote);
exports.showVote = monocle_ts_1.Prism.fromRefinement(isShowVote);
exports.optionA = monocle_ts_1.Prism.fromRefinement(function_1.or(isFilmVote, isShowVote)).composeLens(monocle_ts_1.Lens.fromProp("optionA"));
exports.optionB = monocle_ts_1.Prism.fromRefinement(function_1.or(isFilmVote, isShowVote)).composeLens(monocle_ts_1.Lens.fromProp("optionB"));
exports.optionC = monocle_ts_1.Prism.fromRefinement(isFilmVote).composeLens(monocle_ts_1.Lens.fromProp("optionC"));
exports.voteChoice = new monocle_ts_1.Optional(function (s) { return s[1] == "optionA" ? exports.optionA.getOption(s[0]) :
    s[1] == "optionB" ? exports.optionB.getOption(s[0]) :
        exports.optionC.getOption(s[0]); }, function (a) { return function (s) { return s; }; });
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
exports.strMapValueLens = function (key) {
    return new monocle_ts_1.Lens(function (s) { return fpmap.lookup(key, s); }, function (a) { return function (s) { return a.map(function (ap) { return fpmap.insert(key, ap, s); }).getOrElse(s); }; });
};
exports.findByIdLens = function (id) {
    return new monocle_ts_1.Lens(function (s) { return Array_1.findFirst(s, function (a) { return a.id === id; }); }, function (a) { return function (s) { return s; }; });
};
exports.blackout = monocle_ts_1.Lens.fromProp()("blackout");
exports.paused = monocle_ts_1.Lens.fromProp()("paused");
exports.activeCues = monocle_ts_1.Lens.fromProp()("activeCues");
exports.activeVote = monocle_ts_1.Optional.fromOptionProp()("activeVote");
exports.activeVoteLens = monocle_ts_1.Lens.fromProp()("activeVote");
exports.activeMovie = monocle_ts_1.Optional.fromOptionProp()("activeMovie");
exports.activeMovieLens = monocle_ts_1.Lens.fromProp()("activeMovie");
exports.voteResults = monocle_ts_1.Lens.fromProp()("voteResults")
    .compose(monocle_ts_1.Lens.fromProp("all"));
exports.latestVoteResultId = monocle_ts_1.Lens.fromProp()("voteResults")
    .compose(monocle_ts_1.Lens.fromProp("latest"));
exports.latestVoteResultChoice = new monocle_ts_1.Lens(function (s) { return exports.latestVoteResultId
    .get(s)
    .map(function (lvid) { return exports.voteResult.at(lvid); })
    .chain(function (f) { return f.get(s); }); }, function (a) { return function (s) { return s; }; });
exports.voteResult = new monocle_ts_1.At(function (i) {
    return exports.voteResults.compose(exports.strMapValueLens(i));
});
exports.filmVotes = monocle_ts_1.Lens.fromProp("filmVotes");
exports.showVotes = monocle_ts_1.Lens.fromProp("showVotes");
exports.allVotes = new monocle_ts_1.Lens(function (s) { return s.filmVotes.concat(s.showVotes); }, function (a) { return function (s) { return Array_1.array.reduce(a, s, function (b, a) {
    return (isFilmVote(a) ?
        exports.filmVotes.modify(function (arr) {
            return arr.concat([a]);
        })(s) :
        exports.showVotes.modify(function (arr) {
            return arr.concat([a]);
        })(s));
}); }; });
exports.findVote = new monocle_ts_1.At(function (i) {
    return exports.allVotes.composeLens(exports.findByIdLens(i));
});
function deserializeOption(a) {
    return (a._tag === "None" ? Option_1.none : Option_1.some(a.value));
}
exports.deserializeOption = deserializeOption;
//# sourceMappingURL=types.js.map