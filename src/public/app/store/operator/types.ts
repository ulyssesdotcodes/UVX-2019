import { VoteID, IVoteResult, IVote, ActiveVote } from "../../../../types";
import { string } from "prop-types";
import { WebsocketTypes } from "../common/websocket_types";
import { StateActionTypes } from "../common/state_types";
import { Option } from "fp-ts/lib/Option";

export interface OperatorState {
    filmVotes: Array<IVote>;
    showVotes: Array<IVote>;
    activeVote: Option<ActiveVote>;
    voteResults: Map<string, string>;
}

export const CUE_VOTE = "CUE_VOTE";
export const CUE_BATCH = "CUE_BATCH";
export const GO = "GO";

interface CueVoteAction {
    type: typeof CUE_VOTE;
    payload: VoteID;
}

interface CueBatchAction {
    type: typeof CUE_BATCH;
}

interface GoAction {
    type: typeof GO;
}

export type OperatorActionTypes = CueVoteAction | CueBatchAction | GoAction | StateActionTypes;
