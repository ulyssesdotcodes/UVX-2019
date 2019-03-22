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
var VoteOption_1 = __importDefault(require("./VoteOption"));
var types_1 = require("../../../types");
var uuid = __importStar(require("uuid"));
var _ = __importStar(require("lodash"));
var cookie_storage_1 = require("cookie-storage");
var Option_1 = require("fp-ts/lib/Option");
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            cookie: Option_1.none
        };
        return _this;
    }
    Client.prototype.componentDidMount = function () {
        var cookieStore = new cookie_storage_1.CookieStorage();
        if (cookieStore.length === 0) {
            cookieStore.setItem("id", uuid.v4());
        }
        this.state.cookie = Option_1.fromNullable(cookieStore.getItem("id"));
    };
    Client.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "client" }, this.props.client.activeVote
            .map(function (av) { return av.vote; })
            .map(function (v) {
            return types_1.options(v)
                .map(function (opt) {
                return React.createElement(VoteOption_1.default, { key: opt[1], voteId: v.id, optionText: opt[0], voteChoice: opt[1], vote: _this.state.cookie.map(function (c) { return _.partial(_this.props.thunkVote, c); })
                        .getOrElse(function () { return console.log("Couldn't vote no id"); }) });
            });
        })
            .getOrElse([React.createElement("div", { key: "empty" })])));
    };
    return Client;
}(React.Component));
var mapStateToProps = function (state) { return ({
    client: state.client
}); };
exports.default = react_redux_1.connect(mapStateToProps, { thunkVote: thunks_1.thunkVote })(Client);
//# sourceMappingURL=Client.js.map