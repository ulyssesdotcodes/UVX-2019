import { defaultShowState, IShowState, VOTE_DURATION } from "./types";
import { REDUX_MESSAGE, SendableAction } from "./public/app/store";
import { UPDATE_SHOW_STATE } from "./public/app/store/common/state_types";
import { CUE_BATCH, CUE_VOTE } from "./public/app/store/operator/types";
import * as _ from "lodash";
import * as fs from "fs";
import * as cp from "child_process";
const find = require("find-process");

import * as state from "./state";
import * as td from "./td.ldjs";
import { Socket } from "./Socket";
import * as ldjs from "lambda-designer-js";
import { VOTE } from "./public/app/store/client/types";
import { start } from "repl";

const http = require("http");
const express = require("express");
const app = express();
const path = require("path");
const socketio = require("socket.io");


// TD tcp socket
const tdsock = new Socket("127.0.0.1", 5959);

// Start TD

const startTD = async (callback: () => void) => {
    const arr: Array<any> = await find("name", "TouchPlayer099");

    if (arr.length == 0 && !process.execPath.includes("node")) {
        const tdpath = path.join(process.cwd(), "TD\\FunctionalDesigner.toe");
        const wd = process.cwd();
        process.chdir("C:\\Program Files\\Derivative\\TouchDesigner099\\bin");
        cp.spawn("TouchPlayer099.exe", [tdpath]);
        process.chdir(wd);
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    tdsock.makeConnection();
    callback();
};

startTD(() => console.log("started TD"));

// Web server and socket

app.use(express.static(path.join(__dirname, "public")));

const server = http.Server(app);

const wss = socketio.listen(server);

server.listen(3000);


const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data.json"),
        {encoding: "utf8"}));
let showState: IShowState = Object.assign({}, defaultShowState, data);
function updateVoteWrapper(f: (state: IShowState) => IShowState) {
    showState = f(showState);
    wss.emit(REDUX_MESSAGE, {type: UPDATE_SHOW_STATE, payload: showState});
    if (tdsock.connected) {
        ldjs.validateNodes(td.stateToTD(showState))
        .map(vs => {
            return ldjs.nodesToJSON(vs);
        })
        .map(nodesjson => {
            console.log(nodesjson);
            tdsock.send(nodesjson);
        })
        .mapLeft(errs => console.log(errs));
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
                }, VOTE_DURATION * 1000);
                break;
            case VOTE:
                updateVoteWrapper(_.partialRight(state.vote, message.payload));
                console.log(showState.activeVote.map(a => a.voteMap[message.payload.userId]));
                break;
        }
    });
    socket.emit(REDUX_MESSAGE, {type: UPDATE_SHOW_STATE, payload: showState});
});
