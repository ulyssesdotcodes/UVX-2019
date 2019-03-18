import { OperatorState, CUE_VOTE } from "./store/operator/types";
import { cueVote } from "./store/operator/actions";
import { ThunkAction } from "redux-thunk";
import { Action } from "redux";
import { AppState } from "./store";
import { websocketSend, websocketConnect } from "./store/common/websocket_actions";

export const thunkCueVote = (voteId: string): ThunkAction<void, OperatorState, null, Action<string>> => async (dispatch: any) => {
    dispatch(cueVote(voteId));
    dispatch(websocketSend({type: CUE_VOTE, payload: voteId}));
};

export const connectws = (url: string): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any) => {
    dispatch(websocketConnect({ url }));
};