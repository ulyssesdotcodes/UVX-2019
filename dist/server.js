"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var store_1 = require("./public/app/store");
var state_types_1 = require("./public/app/store/common/state_types");
var data = __importStar(require("./data.json"));
var http = require("http");
var express = require("express");
var app = express();
var path = require("path");
var socketio = require("socket.io");
app.use(express.static(path.join(__dirname, "public")));
var server = http.Server(app);
var wss = socketio.listen(server);
server.listen(3000);
var showState = Object.assign({}, types_1.defaultShowState, data);
wss.on("connection", function connection(socket) {
    socket.on(store_1.REDUX_MESSAGE, function incoming(message) {
        console.log("received: %s", message);
        switch (message.type) {
        }
    });
    socket.emit(store_1.REDUX_MESSAGE, { type: state_types_1.UPDATE_SHOW_STATE, payload: showState });
});
//# sourceMappingURL=server.js.map