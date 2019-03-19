import { defaultShowState, IShowState } from "./types";
import { REDUX_MESSAGE, SendableAction } from "./public/app/store";
import { UPDATE_SHOW_STATE } from "./public/app/store/common/state_types";
import { CUE_BATCH, CUE_VOTE } from "./public/app/store/operator/types";
import * as _ from "lodash";

import * as state from "./state";
import * as data from "./data.json";
import * as td from "./td.ldjs";
import { Socket } from "./Socket";
import * as ldjs from "lambda-designer-js";
import { VOTE } from "./public/app/store/client/types";

const http = require("http");
const express = require("express");
const app = express();
const path = require("path");
const socketio = require("socket.io");

const VOTE_DURATION = 45000;

// Web server and socket

app.use(express.static(path.join(__dirname, "public")));

const server = http.Server(app);

const wss = socketio.listen(server);

server.listen(3000);

// TD tcp socket
const tdsock = new Socket("127.0.0.1", 5959);

tdsock.makeConnection();

let showState: IShowState = Object.assign({}, defaultShowState, data);
function updateVoteWrapper(f: (state: IShowState) => IShowState) {
    showState = f(showState);
    wss.emit(REDUX_MESSAGE, {type: UPDATE_SHOW_STATE, payload: showState});
    if (tdsock.connected) {
        ldjs.validateNodes(td.stateToTD(showState))
        .map(vs => ldjs.nodesToJSON(vs))
        .map(nodesjson => tdsock.send(nodesjson));
    } else {
        tdsock.makeConnection();
    }
}

wss.on("connection", function connection(socket: any) {
    socket.on(REDUX_MESSAGE, function incoming(message: SendableAction) {
        console.log("received: %s", JSON.stringify(message));
        switch (message.type) {
            case CUE_VOTE:
                updateVoteWrapper(_.partialRight(state.startVote, message.payload));
                setTimeout(() => {
                    updateVoteWrapper(state.endVote);
                }, VOTE_DURATION);
                break;
            case VOTE:
                updateVoteWrapper(_.partialRight(state.vote, message.payload));
                console.log(showState.activeVote.map(a => a.voteMap.get(message.payload.userId)));
                break;
        }
    });
    socket.emit(REDUX_MESSAGE, {type: UPDATE_SHOW_STATE, payload: showState});
});
