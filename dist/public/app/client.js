"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var ReactDOM = __importStar(require("react-dom"));
var react_redux_1 = require("react-redux");
var store_1 = __importDefault(require("./store"));
var store = store_1.default();
var Root = function () { return (React.createElement(react_redux_1.Provider, { store: store },
    React.createElement("div", null, "Test"))); };
ReactDOM.render(React.createElement(Root, null), document.getElementById("root"));
//# sourceMappingURL=client.js.map