import { ClientState, ClientActionTypes, VOTE } from "./types";
import { some, none } from "fp-ts/lib/Option";
import { nodeToJSON } from "lambda-designer-js";
import { WEBSOCKET_MESSAGE } from "../common/websocket_types";
import { UPDATE_SHOW_STATE } from "../common/state_types";
import { activeVote } from "../../../../types";

const initialState: ClientState = {
    activeVote: none
};


export function clientReducer(
    state = initialState,
    action: ClientActionTypes
): ClientState {
    switch (action.type) {
        case UPDATE_SHOW_STATE: {
            return {
                ...state,
                // Have to hack this because full class isn't serialized
                ...{ activeVote: action.payload.activeVote._tag === "None" ?
                        none :
                        some(action.payload.activeVote.value) }
            };
        }
        default:
            return state;
    }
}