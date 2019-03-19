import { OperatorState, CUE_VOTE } from "./store/operator/types";
import { cueVote } from "./store/operator/actions";
import { ThunkAction } from "redux-thunk";
import { Action } from "redux";
import { AppState } from "./store";
import { websocketSend, websocketConnect } from "./store/common/websocket_actions";
import { VoteChoice } from "../../types";
import { vote } from "./store/client/actions";
import { VOTE } from "./store/client/types";

export const thunkCueVote = (voteId: string): ThunkAction<void, OperatorState, null, Action<string>> => async (dispatch: any) => {
    dispatch(cueVote(voteId));
    dispatch(websocketSend({type: CUE_VOTE, payload: voteId}));
};

export const thunkVote = (voteId: string, voteChoice: VoteChoice): ThunkAction<void, OperatorState, null, Action<string>> => async (dispatch: any) => {
    const voteAction = { voteId, vote: voteChoice, userId: "hi" };
    dispatch(vote(voteAction));
    dispatch(websocketSend({type: VOTE, payload: voteAction}));
};

export const connectws = (url: string): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any) => {
    dispatch(websocketConnect({ url }));
};