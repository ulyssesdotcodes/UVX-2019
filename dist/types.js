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
exports.isAudioCue = function (v) { return v.audioData; };
exports.isVideoCue = function (v) { return v.videoData; };
exports.isTextCue = function (v) { return v.textData; };
exports.cueId = monocle_ts_1.Lens.fromProp("id");
exports.cueVideoFile = function (cue) {
    return Option_1.fromPredicate(exports.isVideoCue)(cue).map(function (vc) { return vc.file; });
};
exports.cueAudioFile = function (cue) {
    return Option_1.fromPredicate(exports.isAudioCue)(cue).map(function (vc) { return vc.file; });
};
exports.cueText = function (cue) {
    return Option_1.fromPredicate(exports.isTextCue)(cue).map(function (vc) { return vc.text; });
};
var isFilmVote = function (v) { return v.type === "film"; };
exports.isVotedFilmVote = function (v) { return v.optionA !== undefined; };
exports.isBasisFilmVote = function (v) { return v.basis !== undefined; };
exports.isShowVote = function (v) { return v.type === "show"; };
exports.filmVote = monocle_ts_1.Prism.fromRefinement(isFilmVote);
exports.votedFilmVote = monocle_ts_1.Prism.fromRefinement(exports.isVotedFilmVote);
exports.showVote = monocle_ts_1.Prism.fromRefinement(exports.isShowVote);
exports.optionA = monocle_ts_1.Prism.fromRefinement(function_1.or(exports.isVotedFilmVote, exports.isShowVote)).composeLens(monocle_ts_1.Lens.fromProp("optionA"));
exports.optionB = monocle_ts_1.Prism.fromRefinement(function_1.or(exports.isVotedFilmVote, exports.isShowVote)).composeLens(monocle_ts_1.Lens.fromProp("optionB"));
exports.optionC = monocle_ts_1.Prism.fromRefinement(exports.isVotedFilmVote).composeLens(monocle_ts_1.Lens.fromProp("optionC"));
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
exports.activeVoteMap = exports.activeVote.composeLens(monocle_ts_1.Lens.fromProp()("voteMap"));
exports.activeVoteVote = exports.activeVote.composeLens(monocle_ts_1.Lens.fromProp()("vote"));
exports.activeVoteFinish = exports.activeVote.composeLens(monocle_ts_1.Lens.fromProp()("finishTime"));
exports.voteResults = monocle_ts_1.Lens.fromProp()("voteResults");
exports.allVoteResults = exports.voteResults.compose(monocle_ts_1.Lens.fromProp("all"));
exports.latestVoteResultId = monocle_ts_1.Lens.fromProp()("voteResults")
    .compose(monocle_ts_1.Lens.fromProp("latest"));
exports.latestShowVoteId = monocle_ts_1.Lens.fromProp("latestShow");
exports.latestFilmVoteId = monocle_ts_1.Lens.fromProp("latestFilm");
exports.latestVoteResultChoice = function (s) {
    return exports.latestVoteResultId
        .get(s)
        .map(function (lvid) { return exports.voteResults.compose(exports.voteResult.at(lvid)); })
        .chain(function (f) { return f.get(s); });
};
exports.voteResult = new monocle_ts_1.At(function (i) {
    return monocle_ts_1.Lens.fromProp()("all").compose(exports.strMapValueLens(i));
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
exports.cues = monocle_ts_1.Lens.fromProp("cues");
exports.findCue = new monocle_ts_1.At(function (i) { return exports.findByIdLens(i); });
exports.textCues = function (cues) {
    return Array_1.filter(cues, exports.isTextCue);
};
exports.videoCues = function (cues) {
    return Array_1.filter(cues, exports.isVideoCue);
};
exports.audioCues = function (cues) {
    return Array_1.filter(cues, exports.isAudioCue);
};
exports.activeCueList = function (vr, cues) {
    return Array_1.filter(cues, function (c) {
        return Array_1.findFirst(c.showVoteIds, function (_a) {
            var voteId = _a[0], opt = _a[1];
            return exports.latestShowVoteId.get(vr)
                .chain(function (latestShowVoteId) { return latestShowVoteId == voteId ? fpmap.lookup(voteId, vr.all) : Option_1.none; })
                .map(function (vr) { return vr == opt; })
                .getOrElse(false);
        }).isSome();
    });
};
function deserializeOption(a) {
    return (a._tag === "None" ? Option_1.none : Option_1.some(a.value));
}
exports.deserializeOption = deserializeOption;
//# sourceMappingURL=types.js.map