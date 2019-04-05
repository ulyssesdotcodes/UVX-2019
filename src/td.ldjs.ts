import { IShowState, IMovie, IVote, ActiveVote, filmVote, showVote, latestVoteResultId, Cue, cueAudioFile, isAudioCue, activeCues, isTextCue, cueText, AudioCue, TextCue, VideoCue, cueVideoFile, videoCues, audioCues, textCues, votedFilmVote, OptionColor, activeVoteCount, VoteChoice, isShowVote, latestVoteResultChoice, findVote, voteChoice } from "./types";
import { VOTE_DURATION } from "./util";
import { Node, INode, chan, IParam, OP, PulseAction, casti, IParam3 } from "lambda-designer-js";
import * as c from "lambda-designer-js";
import * as _ from "lodash";
import { fromTraversable, Index, Optional } from "monocle-ts";
import { catOptions, array, zipWith, replicate, flatten, unzip, lookup, updateAt, zip, last, findFirst, reverse } from "fp-ts/lib/Array";
import { curry, apply, flip } from "fp-ts/lib/function";
import { Option, none, some, option, fromNullable } from "fp-ts/lib/Option";
import { tuple, Tuple } from "fp-ts/lib/Tuple";
import { Functor1, Functor2 } from "fp-ts/lib/Functor";
import { fold, semigroupString } from "fp-ts/lib/Semigroup";
import { trace, traceM } from "fp-ts/lib/Trace";
import { stat } from "fs";

const timerStartActions: PulseAction[] = [{type: "pulse", param: "initialize", val: 1, frames: 1, delay: 0}, {type: "pulse", param: "start", val: 1, frames: 2, delay: 1}];

type TextCueNode = Node<"TOP">;
type AudioCueNode = Node<"CHOP">;
type VideoCueNode = Node<"TOP">;

export function stateToTD(state: IShowState, prevState: IShowState): Array<INode> {
    const av = state.activeVote.map(curry(voteNode)(state)(prevState.activeVote.chain(av => state.activeVote.map(sav => sav.vote.id === av.vote.id)).getOrElse(false)));
    const activeMovieNode = state.activeMovie.map(curry(movie)(state)(prevState.activeMovie == state.activeMovie));
    const vr = latestVoteResultId.get(state)
        .chain(id => findVote.at(id).get(state))
        .chain(v => latestVoteResultChoice(state).chain(vc => voteChoice.getOption([v, vc])))
        .map(voteResult);

    const [videoCues, audioCues, textCue] = cues(state, prevState, state.activeCues);
    const audioOut =
        c.chop("math", {  chanop: c.mp(1), })
            .run(audioCues.concat(catOptions([
                activeMovieNode.map(n => n[1])
            ]), [c.chop("constant", {  value0: c.fp(0) , name0: c.sp("nothing") }).runT()]))
            .c(c.chop("audiodeviceout"));

    return [c.top("composite", { operand: c.mp(31), resolutionh: 1080, resolutionw: 1920, outputresolution: c.mp(9) })
        .run(reverse(catOptions([activeMovieNode.map(n => n[0]), av, vr]).concat([videoCues], catOptions([textCue]))))
        .connect(c.tope("out")).out()].concat(audioOut.out());
}

function movie(state: IShowState, wasPrev: boolean, movie: IMovie): [Node<"TOP">, Node<"CHOP">] {
    // timer, movie, loop
    const timer = c.chop("timer", {
        length: movie.batchLength * 0.001,
        outtimercount: c.mp(2),
        outdone: c.tp(true),
        play: c.tp(state.paused.isNone())
    }, wasPrev ? [] : timerStartActions, "movieTimer");

    const movieNode = c.top("moviefilein", {
        resolutionh: 1080,
        resolutionw: 1920,
        playmode: c.mp(1),
        file: c.sp(movie.batchFile),
        index: c.chan(c.sp("timer_frames"), timer.runT()),
    });

    const loopNode = c.top("moviefilein", {
        resolutionh: 1080,
        resolutionw: 1920,
        playmode: c.mp(1),
        file: c.sp(movie.loopFile),
        index: c.chan(c.sp("timer_frames"), timer.runT()),
    });

    const movSwitch = c.top("switch", {
        index: chan(c.sp("done"), timer.runT())
    }).run([movieNode, loopNode]);

    const audioSwitch = c.chop("switch", {
        index: casti(chan(c.sp("done"), timer.runT()))
    }).run([c.chop("audiomovie", {  moviefileintop: c.topp(movieNode) }), c.chop("audiomovie", { moviefileintop: c.topp(loopNode) })]);

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

function optionColorToRgbp(col: OptionColor): IParam3<"rgb"> {
    switch (col) {
        case "blue":
            return c.rgbp(c.fp(0), c.fp(0), c.fp(1));
        case "red":
            return c.rgbp(c.fp(1), c.fp(0), c.fp(0));
        default:
            return c.rgbp(c.fp(0), c.fp(0), c.fp(0));
    }
}

function textNode(
    text: IParam<"string">,
    horizonalAlign: number,
    verticalAlign: number,
    width: number,
    height: number,
    xOff: number = 0,
    yOff: number = 0,
    color: Option<OptionColor> = none) {
    return c.top("text", {
        text: text,
        resolutionh: height,
        resolutionw: width,
        outputresolution: c.mp(9),
        bgcolor: optionColorToRgbp(color.getOrElse("white")),
        bgalpha: color.map(_ => 1).getOrElse(0),
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
        t: c.xyp(
            c.fp((horizonalAlign - 1) * 960 - (horizonalAlign - 1) * width * 0.5 + xOff),
            c.fp((verticalAlign - 1) * 540 - (verticalAlign - 1) * height * 0.5 + yOff))
    }));
}

function voteNode(state: IShowState, wasPrev: boolean, vote: ActiveVote): Node<"TOP"> {
    const timer = c.chop("timer", {
        length: VOTE_DURATION,
        play: c.tp(state.paused.isNone()),
        outtimercount: c.mp(3),
    }, wasPrev ? [] : timerStartActions, "voteTimer");

    const timertextleft = textNode(
        c.casts(c.floorp(
            c.subp(
                c.fp(VOTE_DURATION),
                c.chan(c.sp("timer_seconds"), timer.runT())) as IParam<"float">)),
        0, 0, 128, 128, 64, 128);

    const timertextright = textNode(
        c.casts(c.floorp(
            c.subp(
                c.fp(VOTE_DURATION),
                c.chan(c.sp("timer_seconds"), timer.runT())) as IParam<"float">)),
        2, 0, 128, 128, -64, 128);


    const activeVoteCountArr = activeVoteCount(vote.vote, vote.voteMap);
    const voteName = textNode(c.sp(vote.vote.text), 1, 0, 240, 128, 0, 128);
    const optionANode =
        isShowVote(vote.vote) ?
            textNode(c.sp(vote.vote.optionA + "\\n" + activeVoteCountArr["optionA"]), 0, 0, 720, 128, 0, 0, some(vote.vote.optionAColor)) :
            textNode(c.sp(vote.vote.optionA + "\\n" + activeVoteCountArr["optionA"]), 0, 0, 640, 128, 0, 0, none);

    const optionBNode =
        isShowVote(vote.vote) ?
            textNode(c.sp(vote.vote.optionB + "\\n" + activeVoteCountArr["optionB"]), 2, 0, 720, 128, 0, 0, some(vote.vote.optionBColor)) :
            textNode(c.sp(vote.vote.optionB + "\\n" + activeVoteCountArr["optionB"]), 1, 0, 640, 128, 0, 0, none);

    const optionCNode =
        votedFilmVote.getOption(vote.vote).map(v =>
            textNode(c.sp(v.optionC + "\n" + activeVoteCountArr["optionC"]), 2, 0, 640, 128, 0, 0, none));

    const optionlist = [optionANode, optionBNode].concat(catOptions([optionCNode]));

    return c.top("composite", { operand: c.mp(0) })
        .run([timertextleft, timertextright, voteName].concat(optionlist));
}

function voteResult(voteResultName: string): Node<"TOP"> {
    return c.top("composite", { operand: c.mp(0) }).run([textNode(c.sp(voteResultName), 1, 0, 1920, 128, 0, 128).runT(), textNode(c.sp("Loading..."), 1, 0, 1920, 128).runT()]);
}

const mapCues = <CueType, NodeType extends OP>(g: (c: Cue[]) => CueType[], s: (c: [CueType, number]) => Node<NodeType>, cues: [Cue, number][]): Node<NodeType>[] =>
    array.map(zip(g(unzip(cues)[0]), unzip(cues)[1]), s);

const cues = (state: IShowState, prevState: IShowState, cues: [Cue, number][]): [VideoCueNode, AudioCueNode[], Option<TextCueNode>] =>
    [
        c.top("composite", {  operand: c.mp(0), resolutionh: 1080, resolutionw: 1920, outputresolution: c.mp(9) }).run(mapCues(videoCues, curry(videoCueNode)(state), cues)),
        mapCues(audioCues, curry(audioCueNode)(state), cues),
        last(mapCues(textCues, curry(textCueNode)(state)(prevState), cues))
    ];

const audioCueNode = (state: IShowState, [cue, time]: [AudioCue, number]): AudioCueNode =>
    c.chop("audiofilein", {
        file: c.sp(cue.file),
        play: c.tp(state.paused.isNone())
    }).runT();

const textCueNode = (state: IShowState, prevState: IShowState, [cue, time]: [TextCue, number]): TextCueNode =>
    c.top("switch", {
        index: c.chan(c.sp("segment"),
            makeSegmentTimer(cue.id,
                unzip(cue.text)[1],
                findFirst(
                    activeCues.get(prevState),
                    (cd => cd[0].id === cue.id)).isSome()))
    })
        .run(cue.text.map(([t, d]) => textNode(c.sp(t), 1, 0, 1920, 128)));

const makeSegmentTimer = (id: string, times: number[], wasPrev: boolean): Node<"CHOP"> =>
    c.chop("timer", {  segdat: c.datp([c.dat("table", {}, [], undefined,
        "length\n" + fold(semigroupString)("")(array.map(times, t => t * 0.001 + "\n"))
        ).runT()]),
        outseg: c.tp(true),
    }, wasPrev ? [] : timerStartActions, "textCueTimer" + id.replace(/-/g, "_")).runT();

const videoCueNode = (state: IShowState, [cue, time]: [VideoCue, number]): VideoCueNode =>
    c.top("moviefilein", {
        file: c.sp(cue.file),
        play: c.tp(state.paused.isNone()),
    }).runT();