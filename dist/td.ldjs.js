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
var util_1 = require("./util");
var lambda_designer_js_1 = require("lambda-designer-js");
var c = __importStar(require("lambda-designer-js"));
var Array_1 = require("fp-ts/lib/Array");
var function_1 = require("fp-ts/lib/function");
var Semigroup_1 = require("fp-ts/lib/Semigroup");
var timerStartActions = [{ type: "pulse", param: "initialize", val: 1, frames: 1, delay: 0 }, { type: "pulse", param: "start", val: 1, frames: 2, delay: 1 }];
function stateToTD(state, prevState) {
    var av = state.activeVote.map(function_1.curry(voteNode)(state)(prevState.activeVote == state.activeVote));
    var am = state.activeMovie.map(function_1.curry(movie)(state)(prevState.activeMovie == state.activeMovie));
    var vr = types_1.latestVoteResultId.get(state).map(voteResult);
    var _a = cues(state, prevState, state.activeCues), videoCues = _a[0], audioCues = _a[1], textCue = _a[2];
    return [c.top("composite", { operand: c.mp(31), resolutionh: 1080, resolutionw: 1920, outputresolution: c.mp(9) })
            .run(Array_1.reverse(Array_1.catOptions([av, am, vr]).concat([videoCues], Array_1.catOptions([textCue]))))
            .connect(c.tope("out")).out()].concat([audioCues.out()]);
}
exports.stateToTD = stateToTD;
function movie(state, wasPrev, movie) {
    // timer, movie, loop
    var timer = c.chop("timer", {
        length: movie.batchLength * 0.001,
        outtimercount: c.mp(2),
        outdone: c.tp(true),
        play: c.tp(state.paused.isNone())
    }, wasPrev ? [] : timerStartActions, "movieTimer");
    var movieNode = c.top("moviefilein", {
        resolutionh: 1080,
        resolutionw: 1920,
        playmode: c.mp(1),
        file: c.sp(movie.batchFile),
        index: c.chan(c.sp("timer_frames"), timer.runT()),
    });
    var loopNode = c.top("moviefilein", {
        resolutionh: 1080,
        resolutionw: 1920,
        playmode: c.mp(1),
        file: c.sp(movie.loopFile),
        index: c.chan(c.sp("timer_frames"), timer.runT()),
    });
    var movSwitch = c.top("switch", {
        index: lambda_designer_js_1.chan(c.sp("done"), timer.runT())
    }).run([movieNode, loopNode]);
    return movSwitch.c(c.top("resolution", {
        outputresolution: c.mp(9),
        resolutionh: 1080,
        resolutionw: 1920,
        outputaspect: c.mp(1),
    }));
}
function textNode(text, horizonalAlign, verticalAlign, yOff) {
    if (yOff === void 0) { yOff = 0; }
    return c.top("text", {
        text: text,
        resolutionh: 1080,
        resolutionw: 1920,
        outputresolution: c.mp(9),
        alignx: c.mp(horizonalAlign),
        aligny: c.mp(verticalAlign),
        position2: yOff
    });
}
function voteNode(state, wasPrev, vote) {
    var timer = c.chop("timer", {
        length: util_1.VOTE_DURATION,
        play: c.tp(state.paused.isNone()),
        outtimercount: c.mp(3),
    }, wasPrev ? [] : timerStartActions, "voteTimer");
    var timertext = textNode(c.casts(c.floorp(c.subp(c.fp(util_1.VOTE_DURATION), c.chan(c.sp("timer_seconds"), timer.runT())))), 1, 0, 120);
    var voteName = textNode(c.sp(vote.vote.text), 1, 0, 60);
    var optionANode = types_1.votedFilmVote.getOption(vote.vote).map(function (v) { return v.optionA; })
        .alt(types_1.showVote.getOption(vote.vote).map(function (v) { return v.optionA; }))
        .map(function (v) { return textNode(c.sp(v), 0, 0); });
    var optionBNode = types_1.votedFilmVote.getOption(vote.vote).map(function (v) { return v.optionB; })
        .alt(types_1.showVote.getOption(vote.vote).map(function (v) { return v.optionB; }))
        .map(function (v) { return textNode(c.sp(v), 1, 0); });
    var optionCNode = types_1.votedFilmVote.getOption(vote.vote)
        .map(function (v) { return v.optionC; })
        .map(function (v) { return textNode(c.sp(v), 2, 0); });
    var optionlist = [optionANode, optionBNode, optionCNode]
        .filter(function (n) { return n.isSome(); })
        .map(function (n) { return n.getOrElse(c.tope("null")); });
    return c.top("composite", { operand: c.mp(0) })
        .run([timertext, voteName].concat(optionlist));
}
function voteResult(voteResultName) {
    return textNode(c.sp("Vote Result " + voteResultName), 1, 0).runT();
}
var mapCues = function (g, s, cues) {
    return Array_1.array.map(Array_1.zip(g(Array_1.unzip(cues)[0]), Array_1.unzip(cues)[1]), s);
};
var cues = function (state, prevState, cues) {
    return [
        c.top("composite", { operand: c.mp(0), resolutionh: 1080, resolutionw: 1920, outputresolution: c.mp(9) }).run(mapCues(types_1.videoCues, function_1.curry(videoCueNode)(state), cues)),
        c.chop("math", { chopop: c.mp(1), })
            .run(mapCues(types_1.audioCues, function_1.curry(audioCueNode)(state), cues)
            .concat(c.chop("constant", { name0: c.sp("silence"), value0: 0 }).runT()))
            .c(c.chope("audiodeviceout")).runT(),
        Array_1.last(mapCues(types_1.textCues, function_1.curry(textCueNode)(state)(prevState), cues))
    ];
};
var audioCueNode = function (state, _a) {
    var cue = _a[0], time = _a[1];
    return c.chop("audiofilein", {
        file: cue.file,
        play: c.tp(state.paused.isNone())
    }).runT();
};
var textCueNode = function (state, prevState, _a) {
    var cue = _a[0], time = _a[1];
    return c.top("switch", {
        index: c.chan(c.sp("segment"), makeSegmentTimer(cue.id, Array_1.unzip(cue.text)[1], Array_1.findFirst(types_1.activeCues.get(prevState), (function (cd) { return cd[0].id === cue.id; })).isSome()))
    })
        .run(cue.text.map(function (_a) {
        var t = _a[0], d = _a[1];
        return textNode(c.sp(t), 1, 0);
    }));
};
var makeSegmentTimer = function (id, times, wasPrev) {
    return c.chop("timer", { segdat: c.datp([c.dat("table", {}, [], undefined, "length\n" + Semigroup_1.fold(Semigroup_1.semigroupString)("")(Array_1.array.map(times, function (t) { return t + "\n"; }))).runT()]),
        outseg: c.tp(true),
    }, wasPrev ? [] : timerStartActions, "textCueTimer" + id.replace(/-/g, "_")).runT();
};
var videoCueNode = function (state, _a) {
    var cue = _a[0], time = _a[1];
    return c.top("moviefilein", {
        file: c.sp(cue.file),
        play: c.tp(state.paused.isNone()),
    }).runT();
};
//# sourceMappingURL=td.ldjs.js.map