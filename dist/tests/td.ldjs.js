"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var td_ldjs_1 = require("../src/td.ldjs");
var Socket_1 = require("../src/Socket");
var TV = __importStar(require("./testvars"));
var S = __importStar(require("../src/state"));
var T = __importStar(require("../src/types"));
var ldjs = __importStar(require("lambda-designer-js"));
require("mocha");
var socket = new Socket_1.Socket("127.0.0.1", 5959);
socket.makeConnection();
var sendData = function (data) {
    if (!socket.connected) {
        socket.makeConnection();
    }
    ldjs.validateNodes(data)
        .map(function (vs) {
        return ldjs.nodesToJSON(vs);
    })
        .map(function (nodesjson) { return socket.send(nodesjson + "\n"); });
};
describe("TD state changes", function () {
    it("should show a movie if there is one", function (done) {
        sendData(td_ldjs_1.stateToTD(S.runMovie(T.defaultShowState, TV.movie)));
        done();
    });
});
//# sourceMappingURL=td.ldjs.js.map