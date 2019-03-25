import { none } from "fp-ts/lib/Option";
import { IShowState } from "./types";

export const VOTE_DURATION = process.execPath.includes("node") ? 10 : 45;

export const defaultShowState: IShowState = {
    blackout: false,
    paused: !process.execPath.includes("node"),
    activeVote: none,
    activeCues: [],
    activeMovie: none,
    voteResult: none,
    filmVotes: [],
    showVotes: []
};