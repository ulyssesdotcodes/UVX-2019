import { IShowState, IFilmVote, IShowVote, ICue, IVoteAction, activeVote, VoteChoice, IMovie, activeMovie, activeMovieLens, activeVoteLens, IVote, voteResult, voteChoice, activeVoteVote, filmVote, voteMovie, paused, showVote, findVote, options, allVotes, voteResults, latestVoteResultId, latestVoteResultChoice, activeVoteMap, activeVoteFinish, latestShowVoteId, latestFilmVoteId, allVoteResults, activeCues, Cue } from "./types";
import { some, none, Option } from "fp-ts/lib/Option";
import * as fparr from "fp-ts/lib/Array";
import * as fpm from "fp-ts/lib/StrMap";
import * as fpfold from "fp-ts/lib/Foldable2v";
import * as _ from "lodash";
import { stateToTD } from "./td.ldjs";
import { pause } from "./public/app/store/operator/actions";
import { createActiveVote } from "./util";
import { setoidString } from "fp-ts/lib/Setoid";
import { compose, identity } from "fp-ts/lib/function";
import { array } from "prop-types";

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
                compose(
                    allVoteResults.modify(vrs => fpm.insert(av.vote.id, findWinner(av.vote, av.voteMap), vrs)),
                    filmVote.getOption(av.vote).map(_ => voteResults.compose(latestFilmVoteId).set(some(av.vote.id))).getOrElse(identity),
                    showVote.getOption(av.vote).map(_ => voteResults.compose(latestShowVoteId).set(some(av.vote.id))).getOrElse(identity),
                    latestVoteResultId.set(some(av.vote.id))
                )(s))
            .map(activeVoteLens.set(none))
            .getOrElse(s);
}

export function cueBatch(): (s: IShowState) => IShowState {
    return s =>
        latestVoteResultId.get(s)
            .chain(vrid =>
                latestVoteResultChoice(s)
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
    return activeVoteMap.modify(vm => fpm.insert(voteAction.userId, voteAction.vote, vm));
}

export function clearVoteResult(): (state: IShowState) => IShowState {
    return latestVoteResultId.set(none);
}

export function runMovie(state: IShowState, movie: IMovie): IShowState {
    return activeMovieLens.set(some(movie))(state);
}

export function runCue(cue: ICue): (state: IShowState) => IShowState {
    return compose(activeCues.modify(cs => cs.concat([[cue, new Date().getTime() + cue.duration * 1000] as [Cue, number]])), clearInactiveCues);
}

export function clearInactiveCues(state: IShowState): IShowState {
    return activeCues.modify(cs => fparr.filter(cs, ([_, d]) => new Date().getTime() < d))(state);
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
