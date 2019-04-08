import { VoteID, IVote, ActiveVote, VoteChoice, IShowVote, IVoteResults, IMovie, Cue, FilmVote, FinishTime } from "../../../../types";
import { string } from "prop-types";
import { WebsocketTypes } from "../common/websocket_types";
import { StateActionTypes } from "../common/state_types";
import { Option } from "fp-ts/lib/Option";
import { StrMap } from "fp-ts/lib/StrMap";

export interface OperatorState {
    filmVotes: Array<FilmVote>;
    showVotes: Array<IShowVote>;
    cues: Array<Cue>;
    activeVote: Option<ActiveVote>;
    activeMovie: Option<IMovie>;
    activeCues: Array<[Cue, FinishTime]>;
    voteResults: IVoteResults;
    paused: Option<number>;
}


export const CUE_VOTE = "CUE_VOTE";
export const CUE_BATCH = "CUE_BATCH";
export const CHANGE_PAUSED = "CHANGE_PAUSED";
export const END_VOTE = "END_VOTE";
export const CUE_CUE = "CUE_CUE";
export const DECUE_CUE = "DECUE_CUE";
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
interface DecueCue {
    type: typeof DECUE_CUE;
    payload: [string, number | undefined];
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

export type OperatorActionTypes = CueVoteAction | CueBatchAction | ChangePausedAction  | EndVote | CueCue | DecueCue | ClearVoteResult | Reset | StateActionTypes;
