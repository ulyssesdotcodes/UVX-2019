import { ClientState, ClientActionTypes, VOTE } from "./types";
import { some, none } from "fp-ts/lib/Option";
import { nodeToJSON } from "lambda-designer-js";
import { WEBSOCKET_MESSAGE } from "../common/websocket_types";

const initialState: ClientState = {
    vote: none,
    voteChoice: none
};


export function clientReducer(
    state = initialState,
    action: ClientActionTypes
): ClientState {
    switch (action.type) {
        case WEBSOCKET_MESSAGE:
            return {
                ...state,
                vote: some(JSON.parse(action.payload.event.data))
            };
        case VOTE:
        default:
            return state;
    }
}