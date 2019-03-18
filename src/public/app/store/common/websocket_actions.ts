import { AnyAction, Action } from "redux";
import { WebsocketPayload, WEBSOCKET_CONNECT, WEBSOCKET_SEND } from "./websocket_types";
import { SendableAction } from "..";


export function websocketSend(payload: SendableAction) {
  return {
    type: WEBSOCKET_SEND,
    payload
  };
}

export function websocketConnect(payload: { url: string }) {
  return {
    type: WEBSOCKET_CONNECT,
    payload,
  };
}

export function websocketMessage(payload: any) {
  return {
    type: WEBSOCKET_CONNECT,
    payload,
  };
}