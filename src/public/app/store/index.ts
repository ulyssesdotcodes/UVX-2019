import { createStore, combineReducers, applyMiddleware, Store, Middleware, MiddlewareAPI, AnyAction, Action } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import { operatorReducer } from "./operator/reducers";
import { clientReducer } from "./client/reducers";
import { OperatorActionTypes } from "./operator/types";
import { ClientActionTypes, ClientActions } from "./client/types";
import { websocketConnect } from "./common/websocket_actions";
import { WEBSOCKET_MESSAGE, WEBSOCKET_CONNECT, WEBSOCKET_SEND, WebsocketActions } from "./common/websocket_types";
import { Dispatch } from "react";
import io = require("socket.io-client");

export const REDUX_MESSAGE = "redux";

export type SendableAction = OperatorActionTypes | ClientActions;

const rootReducer = combineReducers({
  operator: operatorReducer,
  client: clientReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default function configureStore() {
  const middlewares = [socketMiddleware, thunkMiddleware];
  const middleWareEnhancer = applyMiddleware(...middlewares);

  const store = createStore(
    rootReducer,
    composeWithDevTools(middleWareEnhancer)
  );

  return store;
}

const socketMiddleware: Middleware = (store: MiddlewareAPI) => {
  const socket = io({transports: ["websocket"], upgrade: false});

  socket.on(REDUX_MESSAGE, (message: any) => {
    store.dispatch(message);
  });

  return (next: Dispatch<AnyAction>) => (action: WebsocketActions) => {
    switch (action.type) {
      case WEBSOCKET_CONNECT:
        socket.connect();
        break;
      case WEBSOCKET_SEND:
        socket.emit(REDUX_MESSAGE, action.payload);
      default:
        next(action);
    }
  };
};