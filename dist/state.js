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
    var options = state.activeVote.map(function (av) { return av.vote; }).chain(function (v) {
        return types_1.filmVote.getOption(v).map(function (_) { return ["optionA", "optionB", "optionC"]; })
            .alt(types_1.showVote.getOption(v).map(function (_) { return ["optionA", "optionB"]; }));
    })
        .getOrElse([]);
    var maybeWinner = state.activeVote.map(function (v) {
        return _.reduce(Object.values(v.voteMap), function (voteCount, voteAction) {
            var count = voteCount[voteAction] | 0;
            count += 1;
            voteCount[voteAction] = count;
            return voteCount;
        }, {});
    })
        .map(function (vc) { return _.reduce(vc, function (vv, count, key) {
        return vv[0] > count ? vv : [count, key];
    }, [0, options[Math.floor(Math.random() * options.length)]]); });
    state = types_1.voteResultLens.set(state.activeVote.chain(function (av) {
        return maybeWinner.map(function (winner) { return winner[1]; })
            .chain(function (winnername) { return types_1.voteChoice(av.vote, winnername); });
    }))(state);
    state = types_1.activeVoteLens.set(Option_1.none)(state);
    return state;
}
exports.endVote = endVote;
function cueBatch(state) {
    state = types_1.voteResult
        .getOption(state)
        .chain(function (vr) { return fparr
        .findFirst(state.filmVotes, function (x) { return x.id === vr.voteId; })
        .map(function (fv) { return types_1.voteMovie(fv, vr.choice); }); })
        .map(function (vr) { return Option_1.some(vr); })
        .map(types_1.activeMovieLens.set)
        .map(function (f) { return f(state); })
        .map(types_1.voteResultLens.set(Option_1.none))
        .getOrElse(state);
    state = types_1.activeMovie.getOption(state)
        .map(function (_) { return types_1.voteResultLens.set(Option_1.none)(state); })
        .getOrElse(state);
    return state;
}
exports.cueBatch = cueBatch;
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
function changePaused(state, newPaused) {
    return types_1.paused.set(newPaused)(state);
}
exports.changePaused = changePaused;
//# sourceMappingURL=state.js.map