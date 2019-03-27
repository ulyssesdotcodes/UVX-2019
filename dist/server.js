"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var util_1 = require("./util");
var store_1 = require("./public/app/store");
var state_types_1 = require("./public/app/store/common/state_types");
var types_2 = require("./public/app/store/operator/types");
var fs = __importStar(require("fs"));
var cp = __importStar(require("child_process"));
var find = require("find-process");
var state = __importStar(require("./state"));
var td = __importStar(require("./td.ldjs"));
var Socket_1 = require("./Socket");
var ldjs = __importStar(require("lambda-designer-js"));
var types_3 = require("./public/app/store/client/types");
var function_1 = require("fp-ts/lib/function");
var Option_1 = require("fp-ts/lib/Option");
var http = require("http");
var express = require("express");
var app = express();
var path = require("path");
var socketio = require("socket.io");
// TD tcp socket
var tdsock = new Socket_1.Socket("127.0.0.1", 5959);
// Start TD
var startTD = function (callback) { return __awaiter(_this, void 0, void 0, function () {
    var arr, tdpath, wd;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, find("name", "TouchPlayer099")];
            case 1:
                arr = _a.sent();
                if (!(arr.length == 0 && !process.execPath.includes("node"))) return [3 /*break*/, 3];
                tdpath = path.join(process.cwd(), "TD\\FunctionalDesigner.toe");
                wd = process.cwd();
                process.chdir("C:\\Program Files\\Derivative\\TouchDesigner099\\bin");
                cp.spawn("TouchPlayer099.exe", [tdpath]);
                process.chdir(wd);
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10000); })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                tdsock.makeConnection();
                callback();
                return [2 /*return*/];
        }
    });
}); };
startTD(function () { return console.log("started TD"); });
// Web server and socket
app.use(express.static(path.join(__dirname, "public")));
var server = http.Server(app);
var wss = socketio.listen(server);
server.listen(3000);
var voteTimer = Option_1.none;
var data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data.json"), { encoding: "utf8" }));
var showState = Object.assign({}, util_1.defaultShowState, data);
function updateVoteWrapper(f) {
    var prevState = showState;
    showState = f(showState);
    if (process.execPath.includes("node")) {
        console.log(showState);
    }
    wss.emit(store_1.REDUX_MESSAGE, { type: state_types_1.UPDATE_SHOW_STATE, payload: showState });
    if (tdsock.connected) {
        ldjs.validateNodes(td.stateToTD(showState, prevState))
            .map(function (vs) { return ldjs.nodesToJSON(vs); })
            .map(function (nodesjson) { return tdsock.send(nodesjson); })
            .mapLeft(function (errs) { return console.log(errs); });
    }
    else {
        tdsock.makeConnection();
    }
}
updateVoteWrapper(function_1.identity);
wss.on("connection", function connection(socket) {
    socket.on(store_1.REDUX_MESSAGE, function incoming(message) {
        if (process.execPath.includes("node")) {
            console.log(message);
        }
        switch (message.type) {
            case types_2.CUE_VOTE:
                updateVoteWrapper(state.startVote(message.payload));
                voteTimer =
                    types_1.activeVoteFinish.getOption(showState)
                        .chain(function (av) { return types_1.paused.get(showState).isSome() ? Option_1.none : Option_1.some(av); })
                        .map(function (t) {
                        return setTimeout(function () { return updateVoteWrapper(state.endVote()); }, t - new Date().getTime());
                    });
                break;
            case types_3.VOTE:
                updateVoteWrapper(state.vote(message.payload));
                break;
            case types_2.CHANGE_PAUSED:
                updateVoteWrapper(state.changePaused(message.payload));
                voteTimer = message.payload ?
                    voteTimer.map(function (vt) { return clearTimeout(vt); }).chain(function (_) { return Option_1.none; }) :
                    types_1.activeVoteFinish.getOption(showState)
                        .map(function (t) {
                        return setTimeout(function () { return updateVoteWrapper(state.endVote()); }, t - new Date().getTime());
                    });
                break;
            case types_2.CUE_BATCH:
                updateVoteWrapper(state.cueBatch());
                break;
            case types_2.END_VOTE:
                voteTimer = voteTimer.chain(function (vt) {
                    clearTimeout(vt);
                    return Option_1.none;
                });
                updateVoteWrapper(state.endVote());
                break;
            case types_2.CUE_CUE:
                types_1.findCue.at(message.payload)
                    .get(showState.cues)
                    .map(function (c) { return updateVoteWrapper(state.runCue(c)); });
                break;
            case types_2.RESET:
                updateVoteWrapper(function (_) { return Object.assign({}, util_1.defaultShowState, data); });
                break;
        }
    });
    socket.emit(store_1.REDUX_MESSAGE, { type: state_types_1.UPDATE_SHOW_STATE, payload: showState });
});
//# sourceMappingURL=server.js.map