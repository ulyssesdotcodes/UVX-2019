import { IShowState, activeVoteLens, activeVoteFinish, paused, findCue, isVotedFilmVote, isShowVote, cueDuration } from "./types";
import { VOTE_DURATION, defaultShowState } from "./util";
import { REDUX_MESSAGE, SendableAction } from "./public/app/store";
import { UPDATE_SHOW_STATE } from "./public/app/store/common/state_types";
import { CUE_BATCH, CUE_VOTE, CHANGE_PAUSED, END_VOTE, RESET, CUE_CUE, CLEAR_VOTE_RESULT } from "./public/app/store/operator/types";
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
import { identity, or } from "fp-ts/lib/function";
import { thunkVote } from "./public/app/thunks";
import { none, some, Option } from "fp-ts/lib/Option";
import { pause } from "./public/app/store/operator/actions";

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

let voteTimer: Option<NodeJS.Timeout> = none;

const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data.json"),
        {encoding: "utf8"}));
let showState: IShowState = Object.assign({}, defaultShowState, data);

function updateVoteWrapper(f: (state: IShowState) => IShowState) {
    const prevState = showState;
    showState = f(showState);

    wss.emit(REDUX_MESSAGE, {type: UPDATE_SHOW_STATE, payload: showState});
    if (tdsock.connected) {
        ldjs.validateNodes(td.stateToTD(showState, prevState))
        .map(vs => ldjs.nodesToJSON(vs))
        .map(nodesjson => tdsock.send(nodesjson))
        .mapLeft(errs => console.log(errs));
    } else {
        tdsock.makeConnection();
    }
}

updateVoteWrapper(identity);

wss.on("connection", function connection(socket: any) {
    socket.on(REDUX_MESSAGE, function incoming(message: SendableAction) {
        if (process.execPath.includes("node")) {
            console.log(message);
        }

        switch (message.type) {
            case CUE_VOTE:
                updateVoteWrapper(state.startVote(message.payload));
                voteTimer =
                    activeVoteLens.get(showState)
                        .map(av => av.vote)
                        .filter(or(isVotedFilmVote, isShowVote))
                        .chain(_ => activeVoteFinish.getOption(showState))
                        .chain(av => paused.get(showState).isSome() ? (none as Option<number>) : some(av))
                        .map(t =>
                            setTimeout(() => updateVoteWrapper(state.endVote()),
                                t - new Date().getTime()));
                break;
            case VOTE:
                updateVoteWrapper(state.vote(message.payload));
                break;
            case CHANGE_PAUSED:
                updateVoteWrapper(state.changePaused(message.payload));
                voteTimer = message.payload ?
                    voteTimer.map(vt => clearTimeout(vt)).chain<NodeJS.Timeout>(_ => none) :
                    activeVoteFinish.getOption(showState)
                        .map(t =>
                            setTimeout(
                                () => updateVoteWrapper(state.endVote()),
                                t - new Date().getTime()));
                break;
            case CUE_BATCH:
                updateVoteWrapper(state.cueBatch());
                break;
            case CLEAR_VOTE_RESULT:
                updateVoteWrapper(state.clearVoteResult());
                break;
            case END_VOTE:
                voteTimer = voteTimer.chain(vt => {
                    clearTimeout(vt);
                    return none;
                });
                updateVoteWrapper(state.endVote());
                break;
            case CUE_CUE:
                findCue.at(message.payload)
                    .get(showState.cues)
                    .map(c => {
                        // TODO: Ugly side effect
                        setTimeout(() => updateVoteWrapper(state.clearInactiveCues), cueDuration(c));
                        return c;
                    })
                    .map(c => updateVoteWrapper(state.runCue(c)));
                break;
            case RESET:
                updateVoteWrapper(_ => Object.assign({}, defaultShowState, data));
                break;
        }
    });

    socket.emit(REDUX_MESSAGE, {type: UPDATE_SHOW_STATE, payload: showState});
});
