import { IShowState, IFilmVote, IShowVote, ICue, IVoteAction, activeVote, voteMap, VoteMap, VoteChoice, IMovie, activeMovie, activeMovieLens, activeVoteLens, IVote, voteResult, voteResultLens, voteChoice, activeVoteVote, filmVote, voteMovie } from "./types";
import { some, none, Option } from "fp-ts/lib/Option";
import * as fparr from "fp-ts/lib/Array";
import * as fpfold from "fp-ts/lib/Foldable2v";
import * as _ from "lodash";

export function startVote(state: IShowState, voteId: string): IShowState {
    return fparr
        .findFirst((<IVote[]>state.filmVotes).concat(state.showVotes), x => x.id === voteId)
        .map(vote => {
            return activeVoteLens.set(some({
                vote: vote,
                finishTime: new Date().getTime(),
                voteMap: new Map() as ReadonlyMap<string, VoteChoice>
            }))(state);
        })
        .getOrElse(state);
}

export function endVote(state: IShowState): IShowState {
    const maybeWinner =
        state.activeVote.map(v =>
            _.reduce(Array.from(v.voteMap.values()),
                (voteCount, voteAction: VoteChoice) => {
                    let count = voteCount[voteAction] | 0;
                    count += 1;
                    voteCount[voteAction] = count;
                    return voteCount;
                }, {} as {[key: string]: number}))
            .chain(vc => _.reduce(vc, (v, count, key) =>
                v.map(vv => vv[0] > count ? vv : [count, key] as [number, VoteChoice])
                .alt(some([count, key] as [number, VoteChoice])),
                none as Option<[number, VoteChoice]>));

    state = voteResultLens.set(
        state.activeVote.chain(av =>
            maybeWinner.map(winner => winner[1])
            .chain(winnername => voteChoice(av.vote, winnername)
            .map((w: string) => ({ name: w })))))(state);

    state = activeMovieLens.set(
            activeVote
                .composeLens(activeVoteVote)
                .composePrism(filmVote)
                .getOption(state)
                .chain(fv => maybeWinner.map(w => voteMovie(fv, w[1])))
            )(state);

    state = activeVoteLens.set(none)(state);
    return state;
}

export function vote(state: IShowState, voteAction: IVoteAction): IShowState {
    return activeVote.composeLens(voteMap).modify(vm => {
        const m = new Map(vm.entries());
        m.set(voteAction.userId, voteAction.vote);
        return m as ReadonlyMap<string, VoteChoice>;
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
