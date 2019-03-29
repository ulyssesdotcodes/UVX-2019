import { IShowState, IMovie, IVote, ActiveVote, filmVote, showVote, latestVoteResultId, Cue, cueAudioFile, isAudioCue, activeCues, isTextCue, cueText, AudioCue, TextCue, VideoCue, cueVideoFile, videoCues, audioCues, textCues } from "./types";
import { VOTE_DURATION } from "./util";
import { Node, INode, chan, IParam, OP } from "lambda-designer-js";
import * as c from "lambda-designer-js";
import * as _ from "lodash";
import { fromTraversable, Index, Optional } from "monocle-ts";
import { catOptions, array, fold, zipWith, replicate, flatten, unzip, lookup, updateAt, zip, last } from "fp-ts/lib/Array";
import { curry, apply, flip } from "fp-ts/lib/function";
import { Option, none, some } from "fp-ts/lib/Option";
import { tuple, Tuple } from "fp-ts/lib/Tuple";
import { Functor1, Functor2 } from "fp-ts/lib/Functor";

type TextCueNode = Node<"TOP">;
type AudioCueNode = Node<"CHOP">;
type VideoCueNode = Node<"TOP">;

export function stateToTD(state: IShowState, prevState: IShowState): Array<INode> {
    const av = state.activeVote.map(curry(voteNode)(state)(prevState.activeVote == state.activeVote));
    const am = state.activeMovie.map(curry(movie)(state)(prevState.activeMovie == state.activeMovie));
    const vr = latestVoteResultId.get(state).map(voteResult);
    const [videoCues, audioCues, textCue] = cues(state, state.activeCues);
    return [c.top("composite", { operand: c.mp(31), resolutionh: 1080, resolutionw: 1920, outputresolution: c.mp(9) })
        .run(catOptions([av, am, vr]).concat([videoCues], catOptions([textCue])))
        .connect(c.tope("out")).out()].concat([audioCues.out()]);
}

function movie(state: IShowState, wasPrev: boolean, movie: IMovie): Node<"TOP"> {
    // timer, movie, loop
    const timer = c.chop("timer", {
        length: movie.batchLength + Math.random() * 0.01,
        outtimercount: c.mp(2),
        outdone: c.tp(true),
        play: c.tp(state.paused.isNone())
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
        play: c.tp(state.paused.isNone()),
        outtimercount: c.mp(3),
    }, wasPrev ? [] : [{type: "pulse", param: "start", val: 1, frames: 2}]);

    const timertext = textNode(
        c.casts(c.floorp(
            c.subp(
                c.fp(VOTE_DURATION),
                c.chan(c.sp("timer_seconds"), timer.runT())) as IParam<"float">)),
        1, 0, 120);

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

const mapCues = <CueType, NodeType extends OP>(g: (c: Cue[]) => CueType[], s: (c: [CueType, number]) => Node<NodeType>, cues: [Cue, number][]): Node<NodeType>[] =>
    array.map(zip(g(unzip(cues)[0]), unzip(cues)[1]), s);

const cues = (state: IShowState, cues: [Cue, number][]): [VideoCueNode, AudioCueNode, Option<TextCueNode>] =>
    [
        c.top("composite", {  operand: c.mp(0), resolutionh: 1080, resolutionw: 1920, outputresolution: c.mp(9) }).run(mapCues(videoCues, curry(videoCueNode)(state), cues)),
        c.chop("math", {  chopop: c.mp(1), })
            .run(mapCues(audioCues, curry(audioCueNode)(state), cues)
                .concat(c.chop("constant", { name0: c.sp("silence"), value0: 0 }).runT()))
            .c(c.chope("audiodeviceout")).runT(),
        last(mapCues(textCues, curry(textCueNode)(state), cues))
    ];

const audioCueNode = (state: IShowState, [cue, time]: [AudioCue, number]): AudioCueNode =>
    c.chop("audiofilein", {
        file: cue.file,
        play: c.tp(state.paused.isNone())
    }).runT();

const textCueNode = (state: IShowState, [cue, time]: [TextCue, number]): TextCueNode =>
    c.top("switch", { index: 0 }).run(cue.text.map(([t, d]) => textNode(c.sp(t), 1, 0)));

const videoCueNode = (state: IShowState, [cue, time]: [VideoCue, number]): VideoCueNode =>
    c.top("moviefilein", {
        file: cue.file,
        play: c.tp(state.paused.isNone()),
    }).runT();