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
var types_2 = require("./public/app/store/operator/types");
var _ = __importStar(require("lodash"));
var state = __importStar(require("./state"));
var data = __importStar(require("./data.json"));
var td = __importStar(require("./td.ldjs"));
var Socket_1 = require("./Socket");
var ldjs = __importStar(require("lambda-designer-js"));
var types_3 = require("./public/app/store/client/types");
var http = require("http");
var express = require("express");
var app = express();
var path = require("path");
var socketio = require("socket.io");
var VOTE_DURATION = 45000;
// Web server and socket
app.use(express.static(path.join(__dirname, "public")));
var server = http.Server(app);
var wss = socketio.listen(server);
server.listen(3000);
// TD tcp socket
var tdsock = new Socket_1.Socket("127.0.0.1", 5959);
tdsock.makeConnection();
var showState = Object.assign({}, types_1.defaultShowState, data);
function updateVoteWrapper(f) {
    showState = f(showState);
    wss.emit(store_1.REDUX_MESSAGE, { type: state_types_1.UPDATE_SHOW_STATE, payload: showState });
    if (tdsock.connected) {
        ldjs.validateNodes(td.stateToTD(showState))
            .map(function (vs) { return ldjs.nodesToJSON(vs); })
            .map(function (nodesjson) { return tdsock.send(nodesjson); });
    }
    else {
        tdsock.makeConnection();
    }
}
wss.on("connection", function connection(socket) {
    socket.on(store_1.REDUX_MESSAGE, function incoming(message) {
        console.log("received: %s", JSON.stringify(message));
        switch (message.type) {
            case types_2.CUE_VOTE:
                updateVoteWrapper(_.partialRight(state.startVote, message.payload));
                setTimeout(function () {
                    updateVoteWrapper(state.endVote);
                }, VOTE_DURATION);
                break;
            case types_3.VOTE:
                updateVoteWrapper(_.partialRight(state.vote, message.payload));
                console.log(showState.activeVote.map(function (a) { return a.voteMap.get(message.payload.userId); }));
                break;
        }
    });
    socket.emit(store_1.REDUX_MESSAGE, { type: state_types_1.UPDATE_SHOW_STATE, payload: showState });
});
//# sourceMappingURL=server.js.map