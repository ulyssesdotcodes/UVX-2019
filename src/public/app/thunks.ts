import { OperatorState, CUE_VOTE, CHANGE_PAUSED, CUE_BATCH, RESET, END_VOTE, CUE_CUE, CLEAR_VOTE_RESULT } from "./store/operator/types";
import { cueVote, pause } from "./store/operator/actions";
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

export const thunkCueBatch = (): ThunkAction<void, OperatorState, null, Action<string>> => async (dispatch: any) => {
    dispatch(websocketSend({type: CUE_BATCH}));
};

export const thunkEndVote = (): ThunkAction<void, OperatorState, null, Action<string>> => async (dispatch: any) => {
    dispatch(websocketSend({type: END_VOTE}));
};

export const thunkClearVoteResult = (): ThunkAction<void, OperatorState, null, Action<string>> => async (dispatch: any) => {
    dispatch(websocketSend({type: CLEAR_VOTE_RESULT}));
};

export const thunkReset = (): ThunkAction<void, OperatorState, null, Action<string>> => async (dispatch: any) => {
    dispatch(websocketSend({type: RESET}));
};

export const thunkVote = (userId: string, voteId: string, voteChoice: VoteChoice): ThunkAction<void, OperatorState, null, Action<string>> => async (dispatch: any) => {
    const voteAction = { voteId, vote: voteChoice, userId };
    dispatch(vote(voteAction));
    dispatch(websocketSend({type: VOTE, payload: voteAction}));
};

export const thunkCueCue = (cueId: string): ThunkAction<void, OperatorState, null, Action<string>> => async (dispatch: any) => {
    dispatch(websocketSend({type: CUE_CUE, payload: cueId}));
};

export const thunkChangePaused = (paused: boolean) => async (dispatch: any) => {
    dispatch(websocketSend({type: CHANGE_PAUSED, payload: paused}));
};

export const connectws = (url: string): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any) => {
    dispatch(websocketConnect({ url }));
};