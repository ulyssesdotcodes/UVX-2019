import { IShowState, IMovie, IVote, ActiveVote, filmVote, showVote } from "./types";
import { VOTE_DURATION } from "./util";
import { Node, INode, chan, IParam } from "lambda-designer-js";
import * as c from "lambda-designer-js";
import * as _ from "lodash";
import { fromTraversable } from "monocle-ts";

export function stateToTD(state: IShowState, prevState: IShowState): Array<INode> {
    const av = state.activeVote.map(_.partial(voteNode, state, prevState.activeVote == state.activeVote));
    const am = state.activeMovie.map(_.partial(movie, state, prevState.activeMovie == state.activeMovie));
    return [c.top("composite", { operand: c.mp(31)})
        .run([av, am]
            .filter(n => n.isSome())
            .map(n => n.getOrElse(c.tope("null").runT())))
        .connect(c.tope("out")).out()];
}

function movie(state: IShowState, wasPrev: boolean, movie: IMovie): Node<"TOP"> {
    // timer, movie, loop
    const timer = c.chop("timer", {
        length: movie.batchLength + Math.random() * 0.01,
        outtimercount: c.mp(2),
        outdone: c.tp(true),
        play: c.tp(!state.paused)
    }, wasPrev ? [] : [{type: "pulse", param: "start", val: 1, frames: 2}]);

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

    return movSwitch.c(c.top("resolution", {
        outputresolution: c.mp(9),
        resolutionh: 1080,
        resolutionw: 1920,
        outputaspect: c.mp(1),
    }));
}

function textNode(
    text: IParam<"string">,
    horizonalAlign: number,
    verticalAlign: number,
    yOff: number = 0) {
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

function voteNode(state: IShowState, wasPrev: boolean, vote: ActiveVote): Node<"TOP"> {
    const timer = c.chop("timer", {
        length: VOTE_DURATION,
        play: c.tp(!state.paused),
        outtimercount: c.mp(3),
    }, wasPrev ? [] : [{type: "pulse", param: "start", val: 1, frames: 2}]);

    const timertext = textNode(
        c.casts(
            c.subp(
                c.fp(VOTE_DURATION),
                c.chan(c.sp("timer_seconds"),
                    timer.runT()))), 1, 0, 120);
    const voteName = textNode(c.sp(vote.vote.text), 1, 0, 60);
    const optionANode =
        filmVote.getOption(vote.vote).map(v => v.optionA)
                .alt(showVote.getOption(vote.vote).map(v => v.optionA))
        .map(v => textNode(c.sp(v), 0, 0));
    const optionBNode =
        filmVote.getOption(vote.vote).map(v => v.optionB)
                .alt(showVote.getOption(vote.vote).map(v => v.optionB))
        .map(v => textNode(c.sp(v), 1, 0));

    const optionCNode =
        filmVote.getOption(vote.vote).map(v => v.optionC)
        .map(v => textNode(c.sp(v), 2, 0));

    const optionlist = [optionANode, optionBNode, optionCNode]
        .filter(n => n.isSome())
        .map(n => n.getOrElse(c.tope("null")));

    return c.top("composite", { operand: c.mp(0) })
        .run([timertext, voteName].concat(optionlist));
}

function voteResult(voteResultName: string): Node<"TOP"> {
    return textNode(c.sp("Vote Result " + voteResultName), 1, 0).runT();
}