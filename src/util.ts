import { none, some } from "fp-ts/lib/Option";
import { IShowState, IVote, ActiveVote, VoteChoice, IShowVote, FilmVote, IVotedFilmVote } from "./types";
import { StrMap } from "fp-ts/lib/StrMap";

export const VOTE_DURATION = process.execPath.includes("node") ? 10 : 45;

export const defaultShowState: IShowState = {
    blackout: false,
    paused: process.execPath.includes("node") ? none : some(new Date().getTime()),
    activeVote: none,
    activeCues: [],
    activeMovie: none,
    voteResults: { latest: none, latestFilm: none, latestShow: some("OPEN"), all: new StrMap<VoteChoice>({"OPEN": "optionA"}) },
    filmVotes: [],
    showVotes: [],
    cues: []
};

export function createActiveVote(vote: IShowVote | FilmVote & IVotedFilmVote): ActiveVote {
    return {
        vote,
        finishTime: new Date().getTime() + VOTE_DURATION * 1000,
        voteMap: new StrMap({})
    };
}