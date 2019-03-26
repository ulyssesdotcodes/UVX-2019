import { none } from "fp-ts/lib/Option";
import { IShowState, IVote, ActiveVote, VoteChoice } from "./types";
import { StrMap } from "fp-ts/lib/StrMap";

export const VOTE_DURATION = process.execPath.includes("node") ? 10 : 45;

export const defaultShowState: IShowState = {
    blackout: false,
    paused: !process.execPath.includes("node"),
    activeVote: none,
    activeCues: [],
    activeMovie: none,
    voteResults: { latest: none, all: new StrMap<VoteChoice>({}) },
    filmVotes: [],
    showVotes: []
};

export function createActiveVote(vote: IVote): ActiveVote {
    return {
        vote,
        finishTime: new Date().getTime() + VOTE_DURATION * 1000,
        voteMap: new StrMap({})
    };
}