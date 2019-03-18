import { defaultShowState, IShowState } from "./types";
import { REDUX_MESSAGE, SendableAction } from "./public/app/store";
import { UPDATE_SHOW_STATE } from "./public/app/store/common/state_types";
import { CUE_BATCH, CUE_VOTE } from "./public/app/store/operator/types";

import * as data from "./data.json";

const http = require("http");
const express = require("express");
const app = express();
const path = require("path");
const socketio = require("socket.io");

app.use(express.static(path.join(__dirname, "public")));

const server = http.Server(app);

const wss = socketio.listen(server);

server.listen(3000);

let showState: IShowState = Object.assign({}, defaultShowState, data);

wss.on("connection", function connection(socket: any) {
    socket.on(REDUX_MESSAGE, function incoming(message: SendableAction) {
        console.log("received: %s", message);
        switch (message.type) {
        }
    });
    socket.emit(REDUX_MESSAGE, {type: UPDATE_SHOW_STATE, payload: showState});
});
