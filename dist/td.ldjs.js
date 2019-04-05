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
var Option_1 = require("fp-ts/lib/Option");
var Semigroup_1 = require("fp-ts/lib/Semigroup");
var timerStartActions = [{ type: "pulse", param: "initialize", val: 1, frames: 1, delay: 0 }, { type: "pulse", param: "start", val: 1, frames: 2, delay: 1 }];
function stateToTD(state, prevState) {
    var av = state.activeVote.map(function_1.curry(voteNode)(state)(prevState.activeVote.chain(function (av) { return state.activeVote.map(function (sav) { return sav.vote.id === av.vote.id; }); }).getOrElse(false)));
    var activeMovieNode = state.activeMovie.map(function_1.curry(movie)(state)(prevState.activeMovie == state.activeMovie));
    var vr = types_1.latestVoteResultId.get(state)
        .chain(function (id) { return types_1.findVote.at(id).get(state); })
        .chain(function (v) { return types_1.latestVoteResultChoice(state).chain(function (vc) { return types_1.voteChoice.getOption([v, vc]); }); })
        .map(voteResult);
    var _a = cues(state, prevState, state.activeCues), videoCues = _a[0], audioCues = _a[1], textCue = _a[2];
    var audioOut = c.chop("math", { chanop: c.mp(1), })
        .run(audioCues.concat(Array_1.catOptions([
        activeMovieNode.map(function (n) { return n[1]; })
    ]), [c.chop("constant", { value0: c.fp(0), name0: c.sp("nothing") }).runT()]))
        .c(c.chop("audiodeviceout"));
    return [c.top("composite", { operand: c.mp(31), resolutionh: 1080, resolutionw: 1920, outputresolution: c.mp(9) })
            .run(Array_1.reverse(Array_1.catOptions([activeMovieNode.map(function (n) { return n[0]; }), av, vr]).concat([videoCues], Array_1.catOptions([textCue]))))
            .connect(c.tope("out")).out()].concat(audioOut.out());
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
    var audioSwitch = c.chop("switch", {
        index: lambda_designer_js_1.casti(lambda_designer_js_1.chan(c.sp("done"), timer.runT()))
    }).run([c.chop("audiomovie", { moviefileintop: c.topp(movieNode) }), c.chop("audiomovie", { moviefileintop: c.topp(loopNode) })]);
    return [
        movSwitch.c(c.top("resolution", {
            outputresolution: c.mp(9),
            resolutionh: 1080,
            resolutionw: 1920,
            outputaspect: c.mp(1),
        })),
        audioSwitch
    ];
}
function optionColorToRgbp(col) {
    switch (col) {
        case "blue":
            return c.rgbp(c.fp(0), c.fp(0), c.fp(1));
        case "red":
            return c.rgbp(c.fp(1), c.fp(0), c.fp(0));
        default:
            return c.rgbp(c.fp(0), c.fp(0), c.fp(0));
    }
}
function textNode(text, horizonalAlign, verticalAlign, width, height, xOff, yOff, color) {
    if (xOff === void 0) { xOff = 0; }
    if (yOff === void 0) { yOff = 0; }
    if (color === void 0) { color = Option_1.none; }
    return c.top("text", {
        text: text,
        resolutionh: height,
        resolutionw: width,
        outputresolution: c.mp(9),
        bgcolor: optionColorToRgbp(color.getOrElse("white")),
        bgalpha: color.map(function (_) { return 1; }).getOrElse(0),
        linespacing: c.fp(0.2),
        linespacingunit: c.mp(1),
    }).c(c.top("layout", {
        resolutionw: 1920,
        resolutionh: 1080,
        outputresolution: c.mp(9),
        outputaspect: c.mp(1),
        fit: c.mp(5),
    })).c(c.top("transform", {
        tunit: c.mp(0),
        t: c.xyp(c.fp((horizonalAlign - 1) * 960 - (horizonalAlign - 1) * width * 0.5 + xOff), c.fp((verticalAlign - 1) * 540 - (verticalAlign - 1) * height * 0.5 + yOff))
    }));
}
function voteNode(state, wasPrev, vote) {
    var timer = c.chop("timer", {
        length: util_1.VOTE_DURATION,
        play: c.tp(state.paused.isNone()),
        outtimercount: c.mp(3),
    }, wasPrev ? [] : timerStartActions, "voteTimer");
    var timertextleft = textNode(c.casts(c.floorp(c.subp(c.fp(util_1.VOTE_DURATION), c.chan(c.sp("timer_seconds"), timer.runT())))), 0, 0, 128, 128, 64, 128);
    var timertextright = textNode(c.casts(c.floorp(c.subp(c.fp(util_1.VOTE_DURATION), c.chan(c.sp("timer_seconds"), timer.runT())))), 2, 0, 128, 128, -64, 128);
    var activeVoteCountArr = types_1.activeVoteCount(vote.vote, vote.voteMap);
    var voteName = textNode(c.sp(vote.vote.text), 1, 0, 240, 128, 0, 128);
    var optionANode = types_1.isShowVote(vote.vote) ?
        textNode(c.sp(vote.vote.optionA + "\\n" + activeVoteCountArr["optionA"]), 0, 0, 720, 128, 0, 0, Option_1.some(vote.vote.optionAColor)) :
        textNode(c.sp(vote.vote.optionA + "\\n" + activeVoteCountArr["optionA"]), 0, 0, 640, 128, 0, 0, Option_1.none);
    var optionBNode = types_1.isShowVote(vote.vote) ?
        textNode(c.sp(vote.vote.optionB + "\\n" + activeVoteCountArr["optionB"]), 2, 0, 720, 128, 0, 0, Option_1.some(vote.vote.optionBColor)) :
        textNode(c.sp(vote.vote.optionB + "\\n" + activeVoteCountArr["optionB"]), 1, 0, 640, 128, 0, 0, Option_1.none);
    var optionCNode = types_1.votedFilmVote.getOption(vote.vote).map(function (v) {
        return textNode(c.sp(v.optionC + "\n" + activeVoteCountArr["optionC"]), 2, 0, 640, 128, 0, 0, Option_1.none);
    });
    var optionlist = [optionANode, optionBNode].concat(Array_1.catOptions([optionCNode]));
    return c.top("composite", { operand: c.mp(0) })
        .run([timertextleft, timertextright, voteName].concat(optionlist));
}
function voteResult(voteResultName) {
    return c.top("composite", { operand: c.mp(0) }).run([textNode(c.sp(voteResultName), 1, 0, 1920, 128, 0, 128).runT(), textNode(c.sp("Loading..."), 1, 0, 1920, 128).runT()]);
}
var mapCues = function (g, s, cues) {
    return Array_1.array.map(Array_1.zip(g(Array_1.unzip(cues)[0]), Array_1.unzip(cues)[1]), s);
};
var cues = function (state, prevState, cues) {
    return [
        c.top("composite", { operand: c.mp(0), resolutionh: 1080, resolutionw: 1920, outputresolution: c.mp(9) }).run(mapCues(types_1.videoCues, function_1.curry(videoCueNode)(state), cues)),
        mapCues(types_1.audioCues, function_1.curry(audioCueNode)(state), cues),
        Array_1.last(mapCues(types_1.textCues, function_1.curry(textCueNode)(state)(prevState), cues))
    ];
};
var audioCueNode = function (state, _a) {
    var cue = _a[0], time = _a[1];
    return c.chop("audiofilein", {
        file: c.sp(cue.file),
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
        return textNode(c.sp(t), 1, 0, 1920, 128);
    }));
};
var makeSegmentTimer = function (id, times, wasPrev) {
    return c.chop("timer", { segdat: c.datp([c.dat("table", {}, [], undefined, "length\n" + Semigroup_1.fold(Semigroup_1.semigroupString)("")(Array_1.array.map(times, function (t) { return t * 0.001 + "\n"; }))).runT()]),
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