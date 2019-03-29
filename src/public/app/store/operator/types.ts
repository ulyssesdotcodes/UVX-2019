import { VoteID, IVote, ActiveVote, VoteChoice, IFilmVote, IShowVote, IVoteResults, IMovie, Cue } from "../../../../types";
import { string } from "prop-types";
import { WebsocketTypes } from "../common/websocket_types";
import { StateActionTypes } from "../common/state_types";
import { Option } from "fp-ts/lib/Option";
import { StrMap } from "fp-ts/lib/StrMap";

export interface OperatorState {
    filmVotes: Array<IFilmVote>;
    showVotes: Array<IShowVote>;
    cues: Array<Cue>;
    activeVote: Option<ActiveVote>;
    activeMovie: Option<IMovie>;
    voteResults: IVoteResults;
    paused: Option<number>;
}

export const CUE_VOTE = "CUE_VOTE";
export const CUE_BATCH = "CUE_BATCH";
export const CHANGE_PAUSED = "CHANGE_PAUSED";
export const END_VOTE = "END_VOTE";
export const CUE_CUE = "CUE_CUE";
export const CLEAR_VOTE_RESULT = "CLEAR_VOTE_RESULT";
export const RESET = "RESET";

interface CueVoteAction {
    type: typeof CUE_VOTE;
    payload: VoteID;
}

interface CueBatchAction {
    type: typeof CUE_BATCH;
}

interface EndVote {
    type: typeof END_VOTE;
}

interface CueCue {
    type: typeof CUE_CUE;
    payload: string;
}

interface ClearVoteResult {
    type: typeof CLEAR_VOTE_RESULT;
}

interface Reset {
    type: typeof RESET;
}

interface ChangePausedAction {
    type: typeof CHANGE_PAUSED;
    payload: boolean;
}

export type OperatorActionTypes = CueVoteAction | CueBatchAction | ChangePausedAction  | EndVote | CueCue | ClearVoteResult | Reset | StateActionTypes;
