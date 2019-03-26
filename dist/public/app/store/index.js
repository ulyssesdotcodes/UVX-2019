"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var redux_thunk_1 = __importDefault(require("redux-thunk"));
var redux_devtools_extension_1 = require("redux-devtools-extension");
var reducers_1 = require("./operator/reducers");
var reducers_2 = require("./client/reducers");
var websocket_types_1 = require("./common/websocket_types");
var io = require("socket.io-client");
exports.REDUX_MESSAGE = "redux";
var rootReducer = redux_1.combineReducers({
    operator: reducers_1.operatorReducer,
    client: reducers_2.clientReducer
});
function configureStore() {
    var middlewares = [socketMiddleware, redux_thunk_1.default];
    var middleWareEnhancer = redux_1.applyMiddleware.apply(void 0, middlewares);
    var store = redux_1.createStore(rootReducer, redux_devtools_extension_1.composeWithDevTools(middleWareEnhancer));
    return store;
}
exports.default = configureStore;
var socketMiddleware = function (store) {
    var socket = io({ transports: ["websocket"], upgrade: false });
    socket.on(exports.REDUX_MESSAGE, function (message) {
        store.dispatch(message);
    });
    return function (next) { return function (action) {
        switch (action.type) {
            case websocket_types_1.WEBSOCKET_CONNECT:
                socket.connect();
                break;
            case websocket_types_1.WEBSOCKET_SEND:
                socket.emit(exports.REDUX_MESSAGE, action.payload);
            default:
                next(action);
        }
    }; };
};
//# sourceMappingURL=index.js.map