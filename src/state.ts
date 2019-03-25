import { IShowState, IFilmVote, IShowVote, ICue, IVoteAction, activeVote, voteMap, VoteMap, VoteChoice, IMovie, activeMovie, activeMovieLens, activeVoteLens, IVote, voteResult, voteResultLens, voteChoice, activeVoteVote, filmVote, voteMovie, paused, showVote, voteResultId } from "./types";
import { some, none, Option } from "fp-ts/lib/Option";
import * as fparr from "fp-ts/lib/Array";
import * as fpfold from "fp-ts/lib/Foldable2v";
import * as _ from "lodash";
import { stateToTD } from "./td.ldjs";
import { pause } from "./public/app/store/operator/actions";

export function startVote(state: IShowState, voteId: string): IShowState {
    return fparr
        .findFirst((<IVote[]>state.filmVotes).concat(state.showVotes), x => x.id === voteId)
        .map(vote => {
            return activeVoteLens.set(some({
                vote: vote,
                finishTime: new Date().getTime(),
                voteMap: {}
            }))(state);
        })
        .getOrElse(state);
}

export function endVote(state: IShowState): IShowState {
    const options: VoteChoice[] = state.activeVote.map(av => av.vote).chain(v =>
        filmVote.getOption(v).map(_ => [<VoteChoice>"optionA", <VoteChoice>"optionB", <VoteChoice>"optionC"])
            .alt(showVote.getOption(v).map(_ => [<VoteChoice>"optionA", <VoteChoice>"optionB"])))
            .getOrElse([]);

    const maybeWinner =
        state.activeVote.map(v =>
            _.reduce(Object.values(v.voteMap),
                (voteCount, voteAction: VoteChoice) => {
                    let count = voteCount[voteAction] | 0;
                    count += 1;
                    voteCount[voteAction] = count;
                    return voteCount;
                }, {} as {[key: string]: number}))
            .map(vc => _.reduce(vc, (vv, count, key) =>
                vv[0] > count ? vv : [count, key] as [number, VoteChoice],
                [0, options[Math.floor(Math.random() * options.length)]] as [number, VoteChoice]));

    state = voteResultLens.set(
        state.activeVote.chain(av =>
            maybeWinner.map(winner => winner[1])
            .chain(winnername => voteChoice(av.vote, winnername))))(state);

    state = activeVoteLens.set(none)(state);
    return state;
}

export function cueBatch(state: IShowState): IShowState {
    state = voteResult
        .getOption(state)
        .chain(vr => fparr
                .findFirst(state.filmVotes, x => x.id === vr.voteId)
                .map(fv => voteMovie(fv, vr.choice)))
        .map(vr => some(vr))
        .map(activeMovieLens.set)
        .map(f => f(state))
        .map(voteResultLens.set(none))
        .getOrElse(state);

    state = activeMovie.getOption(state)
        .map(_ => voteResultLens.set(none)(state))
        .getOrElse(state);

    return state;
}

export function vote(state: IShowState, voteAction: IVoteAction): IShowState {
    return activeVote.composeLens(voteMap).modify(vm => {
        const m = {...vm};
        m[voteAction.userId] = voteAction.vote;
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

export function changePaused(state: IShowState, newPaused: boolean): IShowState {
    return paused.set(newPaused)(state);
}