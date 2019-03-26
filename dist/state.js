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
var fpm = __importStar(require("fp-ts/lib/StrMap"));
var util_1 = require("./util");
function startVote(voteId) {
    return function (s) { return types_1.activeVoteLens.set(types_1.findVote.at(voteId)
        .get(s)
        .map(util_1.createActiveVote))(s); };
}
exports.startVote = startVote;
function endVote() {
    var findWinner = function (v, vm) {
        return vm.reduceWithKey(new fpm.StrMap({}), function (k, counts, vc) {
            return fpm.insert(vc, fpm.lookup(vc, counts).getOrElse(1), counts);
        })
            .reduceWithKey([0, types_1.options(v)[Math.floor(Math.random() * types_1.options(v).length)][1]], function (key, vv, count) {
            return vv[0] > count ?
                vv : [count, key];
        })[1];
    };
    return function (s) {
        return types_1.activeVote.getOption(s)
            .map(function (av) {
            return types_1.voteResults.modify(function (vrs) {
                return fpm.insert(av.vote.id, findWinner(av.vote, av.voteMap), vrs);
            })(types_1.latestVoteResultId.set(Option_1.some(av.vote.id))(s));
        })
            .map(types_1.activeVoteLens.set(Option_1.none))
            .getOrElse(s);
    };
}
exports.endVote = endVote;
function cueBatch() {
    return function (s) {
        return types_1.latestVoteResultId.get(s)
            .chain(function (vrid) {
            return types_1.latestVoteResultChoice.get(s)
                .map(function (vrch) { return [vrid, vrch]; });
        })
            .chain(function (vr) { return fparr
            .findFirst(s.filmVotes, function (x) { return x.id === vr[0]; })
            .map(function (fv) { return types_1.voteMovie(fv, vr[1]); }); })
            .map(function (vr) { return Option_1.some(vr); })
            .map(types_1.activeMovieLens.set)
            .map(function (setActiveMovie) { return types_1.latestVoteResultId.set(Option_1.none)(setActiveMovie(s)); })
            .getOrElse(s);
    };
}
exports.cueBatch = cueBatch;
function vote(voteAction) {
    return function (s) {
        return types_1.activeVote.composeLens(types_1.voteMap)
            .modify(function (vm) {
            return fpm.insert(voteAction.userId, voteAction.vote, vm);
        })(s);
    };
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
function changePaused(newPaused) {
    return types_1.paused.set(newPaused);
}
exports.changePaused = changePaused;
//# sourceMappingURL=state.js.map