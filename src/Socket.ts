import * as net from "net";

export class Socket {
    readonly url: string;
    readonly port: number;
    timeout: number = 1000;
    socket: net.Socket;
    connected: boolean = false;

    constructor(url: string, port: number) {
        this.url = url;
        this.port = port;
        this.socket = new net.Socket();
        this.socket.on("connect", this.connectHandler.bind(this));
        this.socket.on("timeout", this.timeoutHandler.bind(this));
        this.socket.on("close", this.closeHandler.bind(this));
        this.socket.on("error", () => {});
    }

    connectHandler() {
        this.connected = true;
    }

    closeHandler() {
        this.connected = false;
        setTimeout(this.makeConnection.bind(this), this.timeout);
    }

    timeoutHandler() {
        setTimeout(this.makeConnection.bind(this), this.timeout);
    }

    makeConnection() {
        this.socket.connect(this.port, this.url);
    }

    send(message: string) {
        if (this.connected) {
            this.socket.write(message + "\n");
        }
    }

    dispose() {
        this.socket.destroy();
    }
}