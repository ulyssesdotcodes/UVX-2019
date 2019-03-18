import { SendableAction } from "..";

export const WEBSOCKET_CONNECT = "websocketConnect";
export const WEBSOCKET_MESSAGE = "websocketMessage";
export const WEBSOCKET_SEND = "websocketSend";

export interface WebsocketMessagePayload {
  event: MessageEvent;
}

export interface WebsocketPayload {
  event: Event;
}

interface WebsocketConnect {
    type: typeof WEBSOCKET_CONNECT;
    payload: { url: string };
}

interface WebsocketMessage {
    type: typeof WEBSOCKET_MESSAGE;
    payload: WebsocketMessagePayload;
}

interface WebsocketSend {
    type: typeof WEBSOCKET_SEND;
    payload: SendableAction;
}

export type WebsocketActions = WebsocketConnect | WebsocketMessage | WebsocketSend;
export type WebsocketTypes = WebsocketConnect | WebsocketMessage;