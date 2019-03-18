"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var net = __importStar(require("net"));
var Socket = /** @class */ (function () {
    function Socket(url, port) {
        this.timeout = 1000;
        this.connected = false;
        this.url = url;
        this.port = port;
        this.socket = new net.Socket();
        this.socket.on("connect", this.connectHandler.bind(this));
        this.socket.on("timeout", this.timeoutHandler.bind(this));
        this.socket.on("close", this.closeHandler.bind(this));
        this.socket.on("error", function () { });
    }
    Socket.prototype.connectHandler = function () {
        this.connected = true;
    };
    Socket.prototype.closeHandler = function () {
        this.connected = false;
        setTimeout(this.makeConnection.bind(this), this.timeout);
    };
    Socket.prototype.timeoutHandler = function () {
        setTimeout(this.makeConnection.bind(this), this.timeout);
    };
    Socket.prototype.makeConnection = function () {
        this.socket.connect(this.port, this.url);
    };
    Socket.prototype.send = function (message) {
        if (this.connected) {
            this.socket.write(message + "\n");
        }
    };
    Socket.prototype.dispose = function () {
        this.socket.destroy();
    };
    return Socket;
}());
exports.Socket = Socket;
//# sourceMappingURL=Socket.js.map