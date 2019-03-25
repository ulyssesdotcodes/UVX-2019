import { stateToTD } from "../src/td.ldjs";
import { Socket } from "../src/Socket";
import * as TV from "./testvars";
import * as S from "../src/state";
import * as T from "../src/types";

import { INode } from "lambda-designer-js";
import * as ldjs from "lambda-designer-js";

import { expect } from "chai";
import "mocha";

const socket = new Socket("127.0.0.1", 5959);
socket.makeConnection();

const sendData = (data: Array<INode>) => {
    if (!socket.connected) {
        socket.makeConnection();
    }

    ldjs.validateNodes(data)
        .map((vs) => {
            return ldjs.nodesToJSON(vs);
        })
        .map(nodesjson => socket.send(nodesjson + "\n"));
};

describe("TD state changes", () => {
    it("should show a movie if there is one", function(done) {
        sendData(stateToTD(S.runMovie(TV.defaultShowState, TV.movie), TV.defaultShowState));
        done();
    });
});