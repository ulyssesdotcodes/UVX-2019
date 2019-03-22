"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lambda_designer_js_1 = require("lambda-designer-js");
var c = __importStar(require("lambda-designer-js"));
var _ = __importStar(require("lodash"));
function stateToTD(state) {
    return state.activeMovie
        .map(_.partial(movie, state))
        .map(function (n) { return n.connect(c.tope("out")).out(); }).map(function (n) { return [n]; }).getOrElse([]);
}
exports.stateToTD = stateToTD;
function movie(state, movie) {
    // timer, movie, loop
    var timer = c.chop("timer", {
        length: movie.batchLength + Math.random() * 0.01,
        outtimercount: c.mp(2),
        outdone: c.tp(true),
        play: c.tp(!state.paused)
    });
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
        resolutionh: 1080,
        resolutionw: 1920,
    }));
}
//# sourceMappingURL=td.ldjs.js.map