import { IShowState, ICue, IVoteAction, activeVote, VoteChoice, IMovie, activeMovieLens, activeVoteLens, IVote, filmVote, voteMovie, paused, showVote, findVote, options, allVotes, voteResults, latestVoteResultId, latestVoteResultChoice, activeVoteMap, activeVoteFinish, latestShowVoteId, latestFilmVoteId, allVoteResults, activeCues, Cue, isVotedFilmVote, IVotedFilmVote, FilmVote, isBasisFilmVote, IBasisFilmVote, IVoteResults, voteResult, isShowVote, cueDuration } from "./types";
import { some, none, Option, isSome, option, fromNullable } from "fp-ts/lib/Option";
import * as fparr from "fp-ts/lib/Array";
import * as fpm from "fp-ts/lib/StrMap";
import * as fpfold from "fp-ts/lib/Foldable2v";
import * as _ from "lodash";
import { createActiveVote } from "./util";
import { compose, identity, Refinement, or } from "fp-ts/lib/function";
import { monoidString } from "fp-ts/lib/Monoid";

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
            .map(vcr => {
                console.log(JSON.stringify(vcr));
                return vcr;
            })
            .filter(vcs => fparr.array.foldr(vcs, true as boolean, (a, b) => a.isSome() && b))
            .map(vcs => fparr.array.map(vcs, vc => vc.map(voteChoiceToNum)))
            .map(vcs => F.reduce(vcs, "", monoidString.concat))
            .chain(nums => fromNullable(bfv.durations[nums]).map(d => [nums, d] as [string, number]))
            .map(([nums, d]) => ({
                batchFile: bfv.prefix + nums + bfv.extension,
                batchLength: d,
                loopFile: bfv.defaultLoop === undefined ?
                    bfv.prefix + nums + "_loop" + bfv.extension :
                    bfv.defaultLoop
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
    const findWinner = (v: IVote, vm: fpm.StrMap<VoteChoice>): VoteChoice => {
            const counts =
                vm.reduceWithKey([new fpm.StrMap({}), 0] as [fpm.StrMap<number>, number],
                    (k, [counts, max], vc) => {
                        const count = fpm.lookup(vc, counts).getOrElse(0) + 1;
                        return [fpm.insert(vc, count, counts), Math.max(count, max)] as [fpm.StrMap<number>, number];
                    });

            const reduced = counts[0].filter(v => v == counts[1]);
            const keys = Object.keys(reduced.value);
            return keys.length > 0 ?
                keys[Math.floor(Math.random() * keys.length)] as VoteChoice :
                options(v)[Math.floor(Math.random() * options(v).length)][1];
        };
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
            .map(activeCues.set([]))
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

export function derunCue(cueid: string, finishTime: number | undefined): (state: IShowState) => IShowState {
    return activeCues.modify(cs => fparr.filter(cs, ([c, n]) => c.id !== cueid || (finishTime != undefined && n != finishTime)));
}

export function runCue(cue: Cue): (state: IShowState) => IShowState {
    return compose(activeCues.modify(cs => cs.concat([[cue, new Date().getTime() + cueDuration(cue)] as [Cue, number]])), clearInactiveCues);
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
