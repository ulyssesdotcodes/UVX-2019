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
function startVote(state, vote) {
    return types_1.activeVote.set({ vote: vote, finishTime: new Date().getTime(), voteMap: new Map() })(state);
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