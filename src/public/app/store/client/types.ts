import { IVoteAction, IVote, IFilmVote, IShowVote, voteChoice } from "../../../../types";
import { Option } from "fp-ts/lib/Option";
import { WebsocketTypes } from "../common/websocket_types";

export interface ClientState {
    vote: Option<IFilmVote | IShowVote>;
    voteChoice: Option<voteChoice>;
}

export const VOTE = "VOTE";

interface ClientVoteAction {
    type: typeof VOTE;
    payload: IVoteAction;
}

export type ClientActionTypes = ClientVoteAction | WebsocketTypes ;
export type ClientActions = ClientVoteAction;