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
var types_1 = require("./types");
var Option_1 = require("fp-ts/lib/Option");
var fparr = __importStar(require("fp-ts/lib/Array"));
function startVote(state, voteId) {
    return fparr
        .findFirst(state.filmVotes.concat(state.showVotes), function (x) { return x.id === voteId; })
        .map(function (vote) {
        console.log(vote);
        return types_1.activeVoteLens.set(Option_1.some({
            vote: vote,
            finishTime: new Date().getTime(),
            voteMap: new Map()
        }))(state);
    })
        .getOrElse(state);
}
exports.startVote = startVote;
function endVote(state) {
    return types_1.activeVoteLens.set(Option_1.none)(state);
}
exports.endVote = endVote;
function vote(state, voteAction) {
    return types_1.activeVote.composeLens(types_1.voteMap).modify(function (vm) {
        var m = new Map(vm.entries());
        m.set(voteAction.userId, voteAction.vote);
        return m;
    })(state);
}
exports.vote = vote;
function runMovie(state, movie) {
    return types_1.activeMovieLens.set(Option_1.some(movie))(state);
}
exports.runMovie = runMovie;
function runCue(state, cue) {
    var clearedState = clearInactiveCues(state);
    var endTime = new Date().getTime() + cue.duration;
    return __assign({}, clearedState, { activeCues: clearedState.activeCues.concat([[cue, endTime]]) });
}
exports.runCue = runCue;
function clearInactiveCues(state) {
    return state;
}
exports.clearInactiveCues = clearInactiveCues;
//# sourceMappingURL=state.js.map