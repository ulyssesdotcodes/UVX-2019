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
export const CHANGE_PAUSED = "CHANGE_PAUSED";

interface CueVoteAction {
    type: typeof CUE_VOTE;
    payload: VoteID;
}

interface CueBatchAction {
    type: typeof CUE_BATCH;
}

interface ChangePausedAction {
    type: typeof CHANGE_PAUSED;
    payload: boolean;
}

export type OperatorActionTypes = CueVoteAction | CueBatchAction | ChangePausedAction | StateActionTypes;
