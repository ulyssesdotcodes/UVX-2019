import { OperatorState, CUE_VOTE, CHANGE_PAUSED } from "./types";

export function cueVote(voteId: string) {
    return {
        type: CUE_VOTE,
        payload: voteId
    };
}

export function pause(paused: boolean) {
    return {
        type: CHANGE_PAUSED,
        payload: paused
    };
}