import { IShowState, IMovie } from "./types";
import { Node, INode, chan } from "lambda-designer-js";
import * as c from "lambda-designer-js";

export function stateToTD(state: IShowState): Array<INode> {
    return state.activeMovie.map(movie).map(n => n.connect(c.tope("out")).out()).map(n => [n]).getOrElse([]);
}

function movie(movie: IMovie): Node<"TOP"> {
    // timer, movie, loop
    const timer = c.chop("timer", {
        length: movie.batchLength,
        outtimercount: c.mp(2),
        outdone: c.tp(true),
    });

    const movieNode = c.top("moviefilein", {
        resolutionh: 1080,
        resolutionw: 1920,
        playmode: c.mp(1),
        file: movie.batchFile,
        index: c.chan(c.sp("timer_frames"), timer.runT()),
    });

    const loopNode = c.top("moviefilein", {
        resolutionh: 1080,
        resolutionw: 1920,
        playmode: c.mp(1),
        file: movie.loopFile,
        index: c.chan(c.sp("timer_frames"), timer.runT()),
    });

    const movSwitch = c.top("switch", {
        index: chan(c.sp("done"), timer.runT())
    }).run([movieNode, loopNode]);

    return movSwitch;
}