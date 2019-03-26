import { OperatorState, OperatorActionTypes, CUE_VOTE, CUE_BATCH } from "./types";
import { string } from "prop-types";
import { none } from "fp-ts/lib/Option";
import { WEBSOCKET_CONNECT } from "../common/websocket_types";
import { UPDATE_SHOW_STATE } from "../common/state_types";
import { activeVote, deserializeOption } from "../../../../types";
import * as fpmap from "fp-ts/lib/StrMap";

const initialState: OperatorState = {
    filmVotes: [],
    showVotes: [],
    voteResults: { latest: none, all: new fpmap.StrMap({}) },
    activeVote: none
};

export function operatorReducer(
    state = initialState,
    action: OperatorActionTypes
): OperatorState {
    switch (action.type) {
        case UPDATE_SHOW_STATE: {
            return {
                ...state,
                ...action.payload,
                ...{activeVote: deserializeOption(action.payload.activeVote)}
            };
        }
        case CUE_VOTE:
        case CUE_BATCH:
        default:
            return state;
    }
}