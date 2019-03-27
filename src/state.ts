import { IShowState, IFilmVote, IShowVote, ICue, IVoteAction, activeVote, VoteChoice, IMovie, activeMovie, activeMovieLens, activeVoteLens, IVote, voteResult, voteChoice, activeVoteVote, filmVote, voteMovie, paused, showVote, findVote, options, allVotes, voteResults, latestVoteResultId, latestVoteResultChoice, activeVoteMap, activeVoteFinish } from "./types";
import { some, none, Option } from "fp-ts/lib/Option";
import * as fparr from "fp-ts/lib/Array";
import * as fpm from "fp-ts/lib/StrMap";
import * as fpfold from "fp-ts/lib/Foldable2v";
import * as _ from "lodash";
import { stateToTD } from "./td.ldjs";
import { pause } from "./public/app/store/operator/actions";
import { createActiveVote } from "./util";
import { setoidString } from "fp-ts/lib/Setoid";

export function startVote(voteId: string): (s: IShowState) => IShowState {
    return s => activeVoteLens.set(
        findVote.at(voteId)
            .get(s)
            .map(createActiveVote))(s);
}

export function endVote(): (s: IShowState) => IShowState {
    const findWinner = (v: IVote, vm: fpm.StrMap<VoteChoice>) =>
            vm.reduceWithKey(new fpm.StrMap({}),
                (k, counts, vc) =>
                    fpm.insert(vc,
                        fpm.lookup(vc, counts).getOrElse(1),
                        counts))
            .reduceWithKey(
                [0, options(v)[Math.floor(Math.random() * options(v).length)][1]] as [number, VoteChoice],
                (key, vv, count) =>
                    vv[0] > count ?
                    vv : [count, key] as [number, VoteChoice])[1];
    return s =>
        activeVote.getOption(s)
            .map(av =>
                voteResults.modify(vrs =>
                    fpm.insert(av.vote.id, findWinner(av.vote, av.voteMap), vrs))
                    (latestVoteResultId.set(some(av.vote.id))(s)))
            .map(activeVoteLens.set(none))
            .getOrElse(s);
}

export function cueBatch(): (s: IShowState) => IShowState {
    return s =>
        latestVoteResultId.get(s)
            .chain(vrid =>
                latestVoteResultChoice.get(s)
                    .map(vrch => [vrid, vrch] as [string, VoteChoice]))
            .chain(vr => fparr
                    .findFirst(s.filmVotes, x => x.id === vr[0])
                    .map(fv => voteMovie(fv, vr[1])))
            .map(vr => some(vr))
            .map(activeMovieLens.set)
            .map(setActiveMovie => latestVoteResultId.set(none)(setActiveMovie(s)))
            .getOrElse(s);
}

export function vote(voteAction: IVoteAction): (state: IShowState) => IShowState {
    return s =>
        activeVoteMap
            .modify(vm =>
                fpm.insert(voteAction.userId, voteAction.vote, vm))(s);
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

export function changePaused(newPaused: boolean): (state: IShowState) => IShowState {
    return s =>
        paused.set(newPaused ? some(new Date().getTime()) : none)(
            paused.get(s)
                .map(p => activeVoteFinish.modify(t => t + new Date().getTime() - p))
                .map(avf => avf(s))
                .getOrElse(s)
        );
}
