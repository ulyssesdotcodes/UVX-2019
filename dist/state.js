"use strict";
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
var fpfold = __importStar(require("fp-ts/lib/Foldable2v"));
var util_1 = require("./util");
var function_1 = require("fp-ts/lib/function");
var Monoid_1 = require("fp-ts/lib/Monoid");
function startVote(voteId) {
    var voteChoiceToNum = function (vc) {
        switch (vc) {
            case "optionA": return "1";
            case "optionB": return "2";
            case "optionC": return "3";
        }
    };
    var F = fpfold.getFoldableComposition(fparr.array, Option_1.option);
    var bfvToMovie = function (bfv, vrs) {
        return Option_1.some(fparr.array.map(bfv.basis, function (s) { return types_1.voteResult.at(s).get(vrs); }))
            .map(function (vcr) {
            console.log(JSON.stringify(vcr));
            return vcr;
        })
            .filter(function (vcs) { return fparr.array.foldr(vcs, true, function (a, b) { return a.isSome() && b; }); })
            .map(function (vcs) { return fparr.array.map(vcs, function (vc) { return vc.map(voteChoiceToNum); }); })
            .map(function (vcs) { return F.reduce(vcs, "", Monoid_1.monoidString.concat); })
            .chain(function (nums) { return Option_1.fromNullable(bfv.durations[nums]).map(function (d) { return [nums, d]; }); })
            .map(function (_a) {
            var nums = _a[0], d = _a[1];
            return ({
                batchFile: bfv.prefix + nums + bfv.extension,
                batchLength: d,
                loopFile: bfv.defaultLoop === undefined ?
                    bfv.prefix + nums + "_loop" + bfv.extension :
                    bfv.defaultLoop
            });
        });
    };
    return function (s) {
        return types_1.findVote.at(voteId).get(s)
            .filter(function_1.or(types_1.isVotedFilmVote, types_1.isShowVote))
            .map(util_1.createActiveVote)
            .map(function (v) { return types_1.activeVoteLens.set(Option_1.some(v))(s); })
            .alt(types_1.findVote.at(voteId).get(s)
            .filter(types_1.isBasisFilmVote)
            .map(function (bfv) { return bfvToMovie(bfv, s.voteResults); })
            .map(function (movie) { return types_1.activeMovieLens.set(movie)(s); }))
            .getOrElse(s);
    };
}
exports.startVote = startVote;
function endVote() {
    var findWinner = function (v, vm) {
        var counts = vm.reduceWithKey([new fpm.StrMap({}), 0], function (k, _a, vc) {
            var counts = _a[0], max = _a[1];
            var count = fpm.lookup(vc, counts).getOrElse(0) + 1;
            return [fpm.insert(vc, count, counts), Math.max(count, max)];
        });
        var reduced = counts[0].filter(function (v) { return v == counts[1]; });
        var keys = Object.keys(reduced.value);
        return keys.length > 0 ?
            keys[Math.floor(Math.random() * keys.length)] :
            types_1.options(v)[Math.floor(Math.random() * types_1.options(v).length)][1];
    };
    return function (s) {
        return types_1.activeVote.getOption(s)
            .map(function (av) {
            return function_1.compose(types_1.allVoteResults.modify(function (vrs) { return fpm.insert(av.vote.id, findWinner(av.vote, av.voteMap), vrs); }), types_1.filmVote.getOption(av.vote).map(function (_) { return types_1.voteResults.compose(types_1.latestFilmVoteId).set(Option_1.some(av.vote.id)); }).getOrElse(function_1.identity), types_1.showVote.getOption(av.vote).map(function (_) { return types_1.voteResults.compose(types_1.latestShowVoteId).set(Option_1.some(av.vote.id)); }).getOrElse(function_1.identity), types_1.latestVoteResultId.set(Option_1.some(av.vote.id)))(s);
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
            return types_1.latestVoteResultChoice(s)
                .map(function (vrch) { return [vrid, vrch]; });
        })
            .chain(function (vr) { return fparr
            .findFirst(s.filmVotes, function (x) { return x.id === vr[0]; })
            .filter(types_1.isVotedFilmVote)
            .map(function (fv) { return types_1.voteMovie(fv, vr[1]); }); })
            .map(function (vr) { return Option_1.some(vr); })
            .map(types_1.activeMovieLens.set)
            .map(function (setActiveMovie) { return types_1.latestVoteResultId.set(Option_1.none)(setActiveMovie(s)); })
            .map(types_1.activeCues.set([]))
            .getOrElse(s);
    };
}
exports.cueBatch = cueBatch;
function vote(voteAction) {
    return types_1.activeVoteMap.modify(function (vm) { return fpm.insert(voteAction.userId, voteAction.vote, vm); });
}
exports.vote = vote;
function clearVoteResult() {
    return types_1.latestVoteResultId.set(Option_1.none);
}
exports.clearVoteResult = clearVoteResult;
function runMovie(state, movie) {
    return types_1.activeMovieLens.set(Option_1.some(movie))(state);
}
exports.runMovie = runMovie;
function derunCue(cueid, finishTime) {
    return types_1.activeCues.modify(function (cs) { return fparr.filter(cs, function (_a) {
        var c = _a[0], n = _a[1];
        return c.id !== cueid || (finishTime != undefined && n != finishTime);
    }); });
}
exports.derunCue = derunCue;
function runCue(cue) {
    return function_1.compose(types_1.activeCues.modify(function (cs) { return cs.concat([[cue, new Date().getTime() + types_1.cueDuration(cue)]]); }), clearInactiveCues);
}
exports.runCue = runCue;
function clearInactiveCues(state) {
    return types_1.activeCues.modify(function (cs) { return fparr.filter(cs, function (_a) {
        var _ = _a[0], d = _a[1];
        return new Date().getTime() < d;
    }); })(state);
}
exports.clearInactiveCues = clearInactiveCues;
function changePaused(newPaused) {
    return function (s) {
        return types_1.paused.set(newPaused ? Option_1.some(new Date().getTime()) : Option_1.none)(types_1.paused.get(s)
            .map(function (p) { return types_1.activeVoteFinish.modify(function (t) { return t + new Date().getTime() - p; }); })
            .map(function (avf) { return avf(s); })
            .getOrElse(s));
    };
}
exports.changePaused = changePaused;
//# sourceMappingURL=state.js.map