"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var websocket_types_1 = require("./websocket_types");
function websocketSend(payload) {
    return {
        type: websocket_types_1.WEBSOCKET_SEND,
        payload: payload
    };
}
exports.websocketSend = websocketSend;
function websocketConnect(payload) {
    return {
        type: websocket_types_1.WEBSOCKET_CONNECT,
        payload: payload,
    };
}
exports.websocketConnect = websocketConnect;
function websocketMessage(payload) {
    return {
        type: websocket_types_1.WEBSOCKET_CONNECT,
        payload: payload,
    };
}
exports.websocketMessage = websocketMessage;
//# sourceMappingURL=websocket_actions.js.map