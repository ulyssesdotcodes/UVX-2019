import { OperatorState, CUE_VOTE } from "./types";

export function cueVote(voteId: string) {
    return {
        type: CUE_VOTE,
        payload: voteId
    };
}