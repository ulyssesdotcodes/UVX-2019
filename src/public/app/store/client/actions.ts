import { ClientState, VOTE } from "./types";
import { IVoteAction } from "../../../../types";

export function vote(voteAction: IVoteAction) {
    return {
        type: VOTE,
        payload: voteAction
    };
}