import { IShowState, IFilmVote, IShowVote, ICue, IVoteAction, activeVote, voteMap, VoteMap, voteChoice, IMovie, activeMovie, activeMovieLens, activeVoteLens } from "./types";
import { some, none, Option } from "fp-ts/lib/Option";

export function startVote(state: IShowState, vote: IFilmVote | IShowVote): IShowState {
    return activeVote.set({vote: vote, finishTime: new Date().getTime(), voteMap: new Map() as ReadonlyMap<string, voteChoice>})(state);
}

export function endVote(state: IShowState): IShowState {
    return activeVoteLens.set(none)(state);
}

export function vote(state: IShowState, voteAction: IVoteAction): IShowState {
    return activeVote.composeLens(voteMap).modify(vm => {
        const m = new Map(vm.entries());
        m.set(voteAction.userId, voteAction.vote);
        return m;
    })(state);
}

export function runMovie(state: IShowState, movie: IMovie): IShowState {
    return activeMovieLens.set(some(movie))(state);
}

export function runCue(state: IShowState, cue: ICue): IShowState {
    const clearedState = clearInactiveCues(state);

    const endTime = new Date().getTime() + cue.duration;
    return {...clearedState, ...{ activeCues: clearedState.activeCues.concat([[cue, endTime]]) }};
}

export function clearInactiveCues(state: IShowState): IShowState {
    return state;
}
