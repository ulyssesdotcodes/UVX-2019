"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var react_redux_1 = require("react-redux");
var thunks_1 = require("../thunks");
var react_router_1 = require("react-router");
var Operator_1 = __importDefault(require("./Components/Operator"));
var Client_1 = __importDefault(require("./Components/Client"));
var Home = /** @class */ (function (_super) {
    __extends(Home, _super);
    function Home() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        return _this;
    }
    Home.prototype.componentDidMount = function () {
    };
    Home.prototype.render = function () {
        return (React.createElement(react_router_1.Router, null,
            React.createElement(react_router_1.Switch, null,
                React.createElement(react_router_1.Route, { exact: true, path: "/", class: Client_1.default }),
                React.createElement(react_router_1.Route, { path: "/operator", class: Operator_1.default }))));
    };
    return Home;
}(React.Component));
var mapStateToProps = function (state) { return ({
    operator: state.operator
}); };
exports.default = react_redux_1.connect(mapStateToProps, { thunkCueVote: thunks_1.thunkCueVote, connectws: thunks_1.connectws })(Operator_1.default);
//# sourceMappingURL=Home.js.map