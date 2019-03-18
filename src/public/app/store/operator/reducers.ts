import { OperatorState, OperatorActionTypes, CUE_VOTE, CUE_BATCH } from "./types";
import { string } from "prop-types";
import { none } from "fp-ts/lib/Option";
import { WEBSOCKET_CONNECT } from "../common/websocket_types";
import { UPDATE_SHOW_STATE } from "../common/state_types";

const initialState: OperatorState = {
    filmVotes: [],
    showVotes: [],
    voteMap: {},
};

export function operatorReducer(
    state = initialState,
    action: OperatorActionTypes
): OperatorState {
    switch (action.type) {
        case UPDATE_SHOW_STATE: {
            console.log(action.payload);
            return {
                ...state,
                ...action.payload
            };
        }
        case CUE_VOTE:
        case CUE_BATCH:
        default:
            return state;
    }
}