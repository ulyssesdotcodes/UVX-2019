import { Lens, Prism, Optional, fromTraversable } from "monocle-ts";
import { some, none, Option } from "fp-ts/lib/Option";
import { Refinement, Predicate } from "fp-ts/lib/function";
import { isNull } from "util";

export const VOTE_DURATION = 45;

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

const isFilmVote: Refinement<IVote, IFilmVote> = (v): v is IFilmVote => v.type === "film";
const isShowVote: Refinement<IVote, IShowVote> = (v): v is IShowVote => v.type === "show";
export const filmVote: Prism<IVote, IFilmVote> = Prism.fromRefinement(isFilmVote);
export const showVote: Prism<IVote, IShowVote> = Prism.fromRefinement(isShowVote);

//     hasOptionAPrism.composeLens(Lens.fromPath("optionA"));

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

export function voteChoice(vote: IVote, vc: VoteChoice): Option<string> {
    switch (vc) {
        case "optionA":
            return (<IShowVote | IFilmVote>vote).optionA ?
                some((<IShowVote | IFilmVote>vote).optionA)
                : none;
        case "optionB":
            return (<IShowVote | IFilmVote>vote).optionB ?
                some((<IShowVote | IFilmVote>vote).optionB)
                : none;
        case "optionC":
            return (<IFilmVote>vote).optionC ?
                some((<IFilmVote>vote).optionC)
                : none;
        default: return none;
    }
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

export interface ICue {
    readonly text: string;
    readonly overlay: Option<string>;
    readonly sound: Option<string>;
    readonly duration: Duration;
}

export interface IMovie {
    readonly batchFile: string;
    readonly batchLength: Duration;
    readonly loopFile: string;
}

export interface IVoteResult {
    readonly voteId: string;
    readonly name: string;
}

export type VoteMap = {[key: string]: VoteChoice};
export interface ActiveVote {
    vote: IVote;
    finishTime: FinishTime;
    voteMap: VoteMap;
}

export const voteMap = Lens.fromProp<ActiveVote>()("voteMap");
export const activeVoteVote = Lens.fromProp<ActiveVote>()("vote");

export interface IShowState {
    readonly blackout: boolean;
    readonly paused: boolean;
    readonly activeCues: Array<[ICue, FinishTime]>;
    readonly activeVote: Option<ActiveVote>;
    readonly activeMovie: Option<IMovie>;
    readonly voteResult: Option<IVoteResult>;
    readonly showVotes: Array<IShowVote>;
    readonly filmVotes: Array<IFilmVote>;
}

export const blackout = Lens.fromProp<IShowState>()("blackout");
export const paused = Lens.fromProp<IShowState>()("paused");
export const activeCues = Lens.fromProp<IShowState>()("activeCues");
export const activeVote: Optional<IShowState, ActiveVote> = Optional.fromOptionProp<IShowState>()("activeVote");
export const activeVoteLens: Lens<IShowState, Option<ActiveVote>> = Lens.fromProp<IShowState>()("activeVote");
export const activeMovie: Optional<IShowState, IMovie> = Optional.fromOptionProp<IShowState>()("activeMovie");
export const activeMovieLens: Lens<IShowState, Option<IMovie>> = Lens.fromProp<IShowState>()("activeMovie");
export const voteResult = Optional.fromOptionProp<IShowState>()("voteResult");
export const voteResultLens = Lens.fromProp<IShowState>()("voteResult");

export const defaultShowState: IShowState = { blackout: false, paused: true, activeVote: none, activeCues: [], activeMovie: none, voteResult: none, filmVotes: [], showVotes: [] };

export function deserializeOption<T>(a: {_tag: string, value?: T}): Option<T> {
    return <Option<T>>(a._tag === "None" ? none : some(a.value));
}