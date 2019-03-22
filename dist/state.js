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
var _ = __importStar(require("lodash"));
function startVote(state, voteId) {
    return fparr
        .findFirst(state.filmVotes.concat(state.showVotes), function (x) { return x.id === voteId; })
        .map(function (vote) {
        return types_1.activeVoteLens.set(Option_1.some({
            vote: vote,
            finishTime: new Date().getTime(),
            voteMap: {}
        }))(state);
    })
        .getOrElse(state);
}
exports.startVote = startVote;
function endVote(state) {
    var maybeWinner = state.activeVote.map(function (v) {
        return _.reduce(Object.values(v.voteMap), function (voteCount, voteAction) {
            var count = voteCount[voteAction] | 0;
            count += 1;
            voteCount[voteAction] = count;
            return voteCount;
        }, {});
    })
        .chain(function (vc) { return _.reduce(vc, function (v, count, key) {
        return v.map(function (vv) { return vv[0] > count ? vv : [count, key]; })
            .alt(Option_1.some([count, key]));
    }, Option_1.none); });
    state = types_1.voteResultLens.set(state.activeVote.chain(function (av) {
        return maybeWinner.map(function (winner) { return winner[1]; })
            .chain(function (winnername) { return types_1.voteChoice(av.vote, winnername)
            .map(function (w) { return ({ voteId: av.vote.id, name: w }); }); });
    }))(state);
    state = types_1.activeMovieLens.set(types_1.activeVote
        .composeLens(types_1.activeVoteVote)
        .composePrism(types_1.filmVote)
        .getOption(state)
        .chain(function (fv) { return maybeWinner.map(function (w) { return types_1.voteMovie(fv, w[1]); }); }))(state);
    state = types_1.activeVoteLens.set(Option_1.none)(state);
    return state;
}
exports.endVote = endVote;
function vote(state, voteAction) {
    return types_1.activeVote.composeLens(types_1.voteMap).modify(function (vm) {
        var m = __assign({}, vm);
        m[voteAction.userId] = voteAction.vote;
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