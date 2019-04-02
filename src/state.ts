import { IShowState, ICue, IVoteAction, activeVote, VoteChoice, IMovie, activeMovieLens, activeVoteLens, IVote, filmVote, voteMovie, paused, showVote, findVote, options, allVotes, voteResults, latestVoteResultId, latestVoteResultChoice, activeVoteMap, activeVoteFinish, latestShowVoteId, latestFilmVoteId, allVoteResults, activeCues, Cue, isVotedFilmVote, IVotedFilmVote, FilmVote, isBasisFilmVote, IBasisFilmVote, IVoteResults, voteResult, isShowVote, cueDuration } from "./types";
import { some, none, Option, isSome, option, fromNullable } from "fp-ts/lib/Option";
import * as fparr from "fp-ts/lib/Array";
import * as fpm from "fp-ts/lib/StrMap";
import * as fpfold from "fp-ts/lib/Foldable2v";
import * as _ from "lodash";
import { stateToTD } from "./td.ldjs";
import { pause } from "./public/app/store/operator/actions";
import { createActiveVote } from "./util";
import { setoidString } from "fp-ts/lib/Setoid";
import { compose, identity, Refinement, or } from "fp-ts/lib/function";
import { find } from "fp-ts/lib/Foldable";
import { create } from "domain";
import { monoidAll, monoidString } from "fp-ts/lib/Monoid";
import { sequence } from "fp-ts/lib/Traversable";
import { getMonoid } from "fp-ts/lib/Applicative";
import { string } from "prop-types";

export function startVote(voteId: string): (s: IShowState) => IShowState {
    const voteChoiceToNum = (vc: VoteChoice): string => {
        switch (vc) {
            case "optionA": return "1";
            case "optionB": return "2";
            case "optionC": return "3";
        }
    };

    const F = fpfold.getFoldableComposition(fparr.array, option);

    const bfvToMovie = (bfv: IBasisFilmVote, vrs: IVoteResults): Option<IMovie> =>
        some(fparr.array.map(bfv.basis, s => voteResult.at(s).get(vrs)))
            .filter(vcs => fparr.array.foldr(vcs, true, (a, b) => a.isSome() && b))
            .map(vcs => fparr.array.map(vcs, vc => vc.map(voteChoiceToNum)))
            .map(vcs => F.reduce(vcs, "", monoidString.concat))
            .chain(nums => fromNullable(bfv.durations[nums]).map(d => [nums, d] as [string, number]))
            .map(([nums, d]) => ({
                batchFile: bfv.prefix + nums + bfv.extension,
                batchLength: d,
                loopFile: bfv.prefix + nums + "_loop" + bfv.extension
            }));

    return s =>
        findVote.at(voteId).get(s)
            .filter(or(isVotedFilmVote, isShowVote))
            .map(createActiveVote)
            .map(v => activeVoteLens.set(some(v))(s))
            .alt(findVote.at(voteId).get(s)
                .filter(isBasisFilmVote)
                .map(bfv => bfvToMovie(bfv, s.voteResults))
                .map(movie => activeMovieLens.set(movie)(s)))
            .getOrElse(s);
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
                    .filter(isVotedFilmVote)
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

export function runCue(cue: Cue): (state: IShowState) => IShowState {
    return compose(activeCues.modify(cs => cs.concat([[cue, new Date().getTime() + cueDuration(cue) * 1000] as [Cue, number]])), clearInactiveCues);
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
