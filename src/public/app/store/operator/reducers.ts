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
    voteResults: { latest: none, latestShow: none, latestFilm: none, all: new fpmap.StrMap({}) },
    activeVote: none,
    paused: none,
    activeMovie: none,
    cues: [],
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
                ...{activeVote: deserializeOption(action.payload.activeVote)},
                ...{activeMovie: deserializeOption(action.payload.activeMovie)},
                ...{paused: deserializeOption(action.payload.paused)},
                ...{voteResults: {
                        latest: deserializeOption(action.payload.voteResults.latest) ,
                        latestShow: deserializeOption(action.payload.voteResults.latestShow),
                        latestFilm: deserializeOption(action.payload.voteResults.latestFilm),
                        all: new fpmap.StrMap(action.payload.voteResults.all.value)
                    }}
            };
        }
        default:
            return state;
    }
}