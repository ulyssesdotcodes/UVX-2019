import { Lens, Prism, Optional, fromTraversable, At, Index, Traversal } from "monocle-ts";
import { some, none, Option, fromPredicate } from "fp-ts/lib/Option";
import { Refinement, Predicate, or } from "fp-ts/lib/function";
import { isNull } from "util";
import * as fpmap from "fp-ts/lib/StrMap";
import { getTraversableComposition } from "fp-ts/lib/Traversable2v";
import { array, findFirst, findIndex, updateAt, filter } from "fp-ts/lib/Array";

export type FinishTime = number;
export type Duration = number;

export type VoteChoice = "optionA" | "optionB" | "optionC";

export type VoteType = "film" | "show";

export type VoteID = string;

export interface IVote {
    readonly id: VoteID;
    readonly operatorName: string;
    readonly text: string;
    readonly type: VoteType;
}

export interface IFilmVote extends IVote {
    readonly type: "film";
    readonly optionA: string;
    readonly optionAMovie: IMovie;
    readonly optionB: string;
    readonly optionBMovie: IMovie;
    readonly optionC: string;
    readonly optionCMovie: IMovie;
}

export interface IShowVote extends IVote {
    readonly type: "show";
    readonly optionA: string;
    readonly optionB: string;
}

export type Cue = ICue & (ITextData | IVideoData | IAudioData);

export interface ICue {
    readonly id: string;
    readonly showVoteIds: [string, VoteChoice][];
    readonly duration: number;
}

export type AudioCue = ICue & IAudioData;
export type TextCue = ICue & ITextData;
export type VideoCue = ICue & IVideoData;

interface ITextData {
    readonly textData: true;
    readonly text: [[string, number]];
}

interface IVideoData {
    readonly videoData: true;
    readonly file: string;
}

interface IAudioData {
    readonly audioData: true;
    readonly file: string;
}

export const isAudioCue: Refinement<Cue, ICue & IAudioData> = (v): v is ICue & IAudioData => (<AudioCue>v).audioData;
export const isVideoCue: Refinement<Cue, ICue & IVideoData> = (v): v is ICue & IVideoData => (<VideoCue>v).videoData;
export const isTextCue: Refinement<Cue, ICue & ITextData> = (v): v is ICue & ITextData => (<TextCue>v).textData;

export const cueId: Lens<ICue, string> = Lens.fromProp("id");
export const cueVideoFile = (cue: Cue): Option<string> =>
    fromPredicate(isVideoCue)(cue).map(vc => vc.file);
export const cueAudioFile = (cue: Cue): Option<string> =>
    fromPredicate(isAudioCue)(cue).map(vc => vc.file);
export const cueText = (cue: Cue): Option<[[string, number]]> =>
    fromPredicate(isTextCue)(cue).map(vc => vc.text);


const isFilmVote: Refinement<IVote, IFilmVote> = (v): v is IFilmVote => v.type === "film";
const isShowVote: Refinement<IVote, IShowVote> = (v): v is IShowVote => v.type === "show";
export const filmVote: Prism<IVote, IFilmVote> = Prism.fromRefinement(isFilmVote);
export const showVote: Prism<IVote, IShowVote> = Prism.fromRefinement(isShowVote);
export const optionA: Optional<IVote, string> =
    Prism.fromRefinement(or(isFilmVote, isShowVote)).composeLens(Lens.fromProp("optionA"));
export const optionB: Optional<IVote, string> =
    Prism.fromRefinement(or(isFilmVote, isShowVote)).composeLens(Lens.fromProp("optionB"));
export const optionC: Optional<IVote, string> =
    Prism.fromRefinement(isFilmVote).composeLens(Lens.fromProp("optionC"));
export const voteChoice: Optional<[IVote, VoteChoice], string> =
    new Optional(
        s => s[1] == "optionA" ? optionA.getOption(s[0]) :
            s[1] == "optionB" ? optionB.getOption(s[0]) :
            optionC.getOption(s[0]),
        a => s => s);

export function options(vote: IVote): [string, VoteChoice][] {
    const optionA: Option<[string, VoteChoice]> =
        (<IFilmVote | IShowVote>vote).optionA ?
            <Option<[string, VoteChoice]>>some([(<IFilmVote | IShowVote>vote).optionA, "optionA"]) :
            <Option<[string, VoteChoice]>>none;
    const optionB: Option<[string, VoteChoice]> =
        (<IFilmVote | IShowVote>vote).optionB ?
            <Option<[string, VoteChoice]>>some([(<IFilmVote | IShowVote>vote).optionB, "optionB"]) :
            <Option<[string, VoteChoice]>>none;
    const optionC: Option<[string, VoteChoice]> =
        (<IFilmVote>vote).optionC ?
            <Option<[string, VoteChoice]>>some([(<IFilmVote>vote).optionC, "optionC"]) :
            <Option<[string, VoteChoice]>>none;
    return [optionA, optionB, optionC].filter(v => v.isSome()).map(v => v.getOrElse(["", "optionA"]));
}

export function voteMovie(vote: IFilmVote, vc: VoteChoice): IMovie {
    switch (vc) {
        case "optionA":
            return vote.optionAMovie;
        case "optionB":
            return vote.optionBMovie;
        case "optionC":
            return vote.optionCMovie;
    }
}

export interface IVoteAction {
    readonly voteId: string;
    readonly userId: string;
    readonly vote: VoteChoice;
}

export interface IMovie {
    readonly batchFile: string;
    readonly batchLength: Duration;
    readonly loopFile: string;
}

export interface ActiveVote {
    vote: IVote;
    finishTime: FinishTime;
    voteMap: fpmap.StrMap<VoteChoice>;
}

export interface IVoteResults {
    readonly latest: Option<string>;
    readonly latestFilm: Option<string>;
    readonly latestShow: Option<string>;
    readonly all: fpmap.StrMap<VoteChoice>;
}

export interface IShowState {
    readonly blackout: boolean;
    readonly paused: Option<number>;
    readonly activeCues: Array<[Cue, FinishTime]>;
    readonly activeVote: Option<ActiveVote>;
    readonly activeMovie: Option<IMovie>;
    readonly voteResults: IVoteResults;
    readonly showVotes: Array<IShowVote>;
    readonly filmVotes: Array<IFilmVote>;
    readonly cues: Array<Cue>;
}

export const strMapValueLens =  <A>(key: string) =>
    new Lens<fpmap.StrMap<A>, Option<A>>(s => fpmap.lookup(key, s), a => s => a.map(ap => fpmap.insert(key, ap, s)).getOrElse(s));

export const findByIdLens = <A extends {id: string}>(id: string) =>
    new Lens<Array<A>, Option<A>>(
        s => findFirst(s, a => a.id === id),
        a => s => s
    );

export const blackout = Lens.fromProp<IShowState>()("blackout");
export const paused = Lens.fromProp<IShowState>()("paused");
export const activeCues = Lens.fromProp<IShowState>()("activeCues");
export const activeVote: Optional<IShowState, ActiveVote> = Optional.fromOptionProp<IShowState>()("activeVote");
export const activeVoteLens: Lens<IShowState, Option<ActiveVote>> = Lens.fromProp<IShowState>()("activeVote");
export const activeMovie: Optional<IShowState, IMovie> = Optional.fromOptionProp<IShowState>()("activeMovie");
export const activeMovieLens: Lens<IShowState, Option<IMovie>> = Lens.fromProp<IShowState>()("activeMovie");

export const activeVoteMap =
    activeVote.composeLens(Lens.fromProp<ActiveVote>()("voteMap"));
export const activeVoteVote =
    activeVote.composeLens(Lens.fromProp<ActiveVote>()("vote"));
export const activeVoteFinish =
    activeVote.composeLens(Lens.fromProp<ActiveVote>()("finishTime"));

export const voteResults = Lens.fromProp<IShowState>()("voteResults");
export const allVoteResults = voteResults.compose(Lens.fromProp("all"));
export const latestVoteResultId =
    Lens.fromProp<IShowState>()("voteResults")
        .compose(Lens.fromProp("latest"));
export const latestShowVoteId: Lens<IVoteResults, Option<string>> = Lens.fromProp("latestShow");
export const latestFilmVoteId: Lens<IVoteResults, Option<string>> = Lens.fromProp("latestFilm");

export const latestVoteResultChoice = (s: IShowState) =>
        latestVoteResultId
            .get(s)
            .map(lvid => voteResult.at(lvid))
            .chain(f => f.get(s));

export const voteResult =
    new At<IShowState, string, Option<VoteChoice>>(i =>
        allVoteResults.compose(strMapValueLens(i)));

export const filmVotes: Lens<IShowState, Array<IFilmVote>> =
    Lens.fromProp("filmVotes");
export const showVotes: Lens<IShowState, Array<IShowVote>> =
    Lens.fromProp("showVotes");
export const allVotes: Lens<IShowState, Array<IVote>> =
    new Lens(
        s => (<IVote[]>s.filmVotes).concat(s.showVotes),
        a => s => array.reduce(a, s, (b, a) =>
            (isFilmVote(a) ?
                filmVotes.modify((arr: IFilmVote[]) =>
                    arr.concat([<IFilmVote>a]))(s) :
                showVotes.modify((arr: IShowVote[]) =>
                    arr.concat([<IShowVote>a]))(s))));

export const findVote =
    new At<IShowState, string, Option<IVote>>(i =>
        allVotes.composeLens(findByIdLens(i))
    );

export const cues: Lens<IShowState, Array<Cue>> = Lens.fromProp("cues");
export const findCue =
    new At<Cue[], string, Option<Cue>>(i => findByIdLens(i));
export const textCues = (cues: Cue[]): TextCue[] =>
    filter(cues, isTextCue);
export const videoCues = (cues: Cue[]): VideoCue[] =>
    filter(cues, isVideoCue);
export const audioCues = (cues: Cue[]): AudioCue[] =>
    filter(cues, isAudioCue);

export const activeCueList = (vr: IVoteResults, cues: Array<Cue>): Array<Cue> =>
    filter(cues, c =>
        findFirst(c.showVoteIds, ([voteId, opt]) =>
            latestShowVoteId.get(vr)
                .chain(latestShowVoteId => latestShowVoteId == voteId ? fpmap.lookup(voteId, vr.all) : none)
                .map(vr => vr == opt)
                .getOrElse(false)).isSome());

export function deserializeOption<T>(a: {_tag: string, value?: T}): Option<T> {
    return <Option<T>>(a._tag === "None" ? none : some(a.value));
}