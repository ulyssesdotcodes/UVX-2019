import { IVoteAction, IVote, IShowVote, VoteChoice, ActiveVote, FinishTime, Cue } from "../../../../types";
import { Option } from "fp-ts/lib/Option";
import { WebsocketTypes } from "../common/websocket_types";
import { StateActionTypes } from "../common/state_types";

export interface ClientState {
    activeVote: Option<ActiveVote>;
    activeCues: Array<[Cue, FinishTime]>;
}

export const VOTE = "VOTE";

interface ClientVoteAction {
    type: typeof VOTE;
    payload: IVoteAction;
}

export type ClientActionTypes = ClientVoteAction | StateActionTypes ;
export type ClientActions = ClientVoteAction;