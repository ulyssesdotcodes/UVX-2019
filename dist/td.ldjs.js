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
var lambda_designer_js_1 = require("lambda-designer-js");
var c = __importStar(require("lambda-designer-js"));
var _ = __importStar(require("lodash"));
function stateToTD(state) {
    var av = state.activeVote.map(_.partial(voteNode, state));
    var am = state.activeMovie.map(_.partial(movie, state));
    return [c.top("composite", { operand: c.mp(31) })
            .run([av, am]
            .filter(function (n) { return n.isSome(); })
            .map(function (n) { return n.getOrElse(c.tope("null").runT()); }))
            .connect(c.tope("out")).out()];
}
exports.stateToTD = stateToTD;
function movie(state, movie) {
    // timer, movie, loop
    var timer = c.chop("timer", {
        length: movie.batchLength + Math.random() * 0.01,
        outtimercount: c.mp(2),
        outdone: c.tp(true),
        play: c.tp(!state.paused)
    }, [{ type: "pulse", param: "start", val: 1, frames: 1 }]);
    var movieNode = c.top("moviefilein", {
        resolutionh: 1080,
        resolutionw: 1920,
        playmode: c.mp(1),
        file: movie.batchFile,
        index: c.chan(c.sp("timer_frames"), timer.runT()),
    });
    var loopNode = c.top("moviefilein", {
        resolutionh: 1080,
        resolutionw: 1920,
        playmode: c.mp(1),
        file: movie.loopFile,
        index: c.chan(c.sp("timer_frames"), timer.runT()),
    });
    var movSwitch = c.top("switch", {
        index: lambda_designer_js_1.chan(c.sp("done"), timer.runT())
    }).run([movieNode, loopNode]);
    return movSwitch.c(c.top("resolution", {
        soutputresolution: c.mp(9),
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
function voteNode(state, vote) {
    var timer = c.chop("timer", {
        length: types_1.VOTE_DURATION,
        play: c.tp(!state.paused),
        outtimercount: c.mp(3),
    }, [{ type: "pulse", param: "start", val: 1, frames: 1 }]);
    var timertext = textNode(c.casts(c.subp(c.fp(types_1.VOTE_DURATION), c.chan(c.sp("timer_seconds"), timer.runT()))), 1, 0, 120);
    var voteName = textNode(c.sp(vote.vote.text), 1, 0, 60);
    var optionANode = types_1.filmVote.getOption(vote.vote).map(function (v) { return v.optionA; })
        .alt(types_1.showVote.getOption(vote.vote).map(function (v) { return v.optionA; }))
        .map(function (v) { return textNode(c.sp(v), 0, 0); });
    var optionBNode = types_1.filmVote.getOption(vote.vote).map(function (v) { return v.optionB; })
        .alt(types_1.showVote.getOption(vote.vote).map(function (v) { return v.optionB; }))
        .map(function (v) { return textNode(c.sp(v), 1, 0); });
    var optionCNode = types_1.filmVote.getOption(vote.vote).map(function (v) { return v.optionC; })
        .map(function (v) { return textNode(c.sp(v), 2, 0); });
    var optionlist = [optionANode, optionBNode, optionCNode]
        .filter(function (n) { return n.isSome(); })
        .map(function (n) { return n.getOrElse(c.tope("null")); });
    return c.top("composite", { operand: c.mp(0) })
        .run([timertext, voteName].concat(optionlist));
}
function voteResult(voteResult) {
    return textNode(c.sp(voteResult.name), 1, 0).runT();
}
//# sourceMappingURL=td.ldjs.js.map