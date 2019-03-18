import { IShowState } from "../../../../types";
import { UPDATE_SHOW_STATE, StateActionTypes } from "./state_types";

export function updateState(state: IShowState): StateActionTypes {
    return {
        type: UPDATE_SHOW_STATE,
        payload: state
    };
}