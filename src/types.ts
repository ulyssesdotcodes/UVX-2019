import { Lens, Prism, Optional } from "monocle-ts";
import { some, none, Option } from "fp-ts/lib/Option";

export type FinishTime = number;
export type Duration = number;

export type voteChoice = "optionA" | "optionB" | "optionC";

export type VoteType = "film" | "show";

export type VoteID = string;

export interface IVote {
    readonly id: VoteID;
    readonly operatorName: string;
    readonly text: string;
    readonly type: VoteType;
}

export interface IFilmVote extends IVote {
    readonly optionA: string;
    readonly optionAMovie: IMovie;
    readonly optionB: string;
    readonly optionBMovie: IMovie;
    readonly optionC: string;
    readonly optionCMovie: IMovie;
}

export interface IShowVote extends IVote {
    readonly optionA: string;
    readonly optionB: string;
}

export interface IVoteAction {
    readonly voteId: string;
    readonly userId: string;
    readonly vote: voteChoice;
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
    readonly name: string;
}

export type VoteMap = ReadonlyMap<string, voteChoice>;
export interface ActiveVote {
    vote: IVote;
    finishTime: FinishTime;
    voteMap: VoteMap;
}

export const voteMap = Lens.fromProp<ActiveVote>()("voteMap");

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

export const defaultShowState: IShowState = { blackout: false, paused: true, activeVote: none, activeCues: [], activeMovie: none, voteResult: none, filmVotes: [], showVotes: [] };