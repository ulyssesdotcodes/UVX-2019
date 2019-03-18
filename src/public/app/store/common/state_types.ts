import { IShowState } from "../../../../types";

export const UPDATE_SHOW_STATE = "updateShowState";

interface UpdateShowState {
    type: typeof UPDATE_SHOW_STATE;
    payload: IShowState;
}

export type StateActionTypes = UpdateShowState;