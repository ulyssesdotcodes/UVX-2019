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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var Array_1 = require("fp-ts/lib/Array");
var Foldable2v_1 = require("fp-ts/lib/Foldable2v");
var Setoid_1 = require("fp-ts/lib/Setoid");
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            cookie: Option_1.none,
            textCueIdx: Option_1.none,
            textCue: [],
            updateTime: new Date().getTime()
        };
        setInterval(function () { return _this.setState(__assign({}, _this.state, { updateTime: new Date().getTime() })); }, 500);
        return _this;
    }
    Client.prototype.componentDidMount = function () {
        var cookieStore = new cookie_storage_1.CookieStorage();
        if (cookieStore.length === 0) {
            cookieStore.setItem("id", uuid.v4());
        }
        this.state.cookie = Option_1.fromNullable(cookieStore.getItem("id"));
        this.state.textCue =
            Array_1.head(Array_1.filter(this.props.client.activeCues, function (cn) { return types_1.isTextCue(cn[0]); }))
                .map(function (_a) {
                var tc = _a[0], n = _a[1];
                return Array_1.zip(Array_1.unzip(tc.text)[0], Array_1.scanRight(Array_1.unzip(tc.text)[1], n, function (b, a) { return b - a; }));
            })
                .getOrElse([]);
    };
    Client.prototype.componentDidUpdate = function (prevProps, prevState) {
        var textCue = Array_1.head(Array_1.filter(this.props.client.activeCues, function (cn) { return types_1.isTextCue(cn[0]); }))
            .map(function (_a) {
            var tc = _a[0], n = _a[1];
            return Array_1.zip(Array_1.unzip(tc.text)[0], Array_1.scanRight(Array_1.unzip(tc.text)[1], n, function (a, b) { return b - a; }));
        })
            .getOrElse([]);
        if (!Setoid_1.getArraySetoid(Setoid_1.getTupleSetoid(Setoid_1.setoidString, Setoid_1.setoidNumber)).equals(textCue, prevState.textCue)) {
            this.setState(__assign({}, this.state, { textCue: textCue }));
        }
    };
    Client.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "client" },
            React.createElement("div", null,
                React.createElement("h1", null, "Welcome to the UVX")),
            Foldable2v_1.findFirst(Array_1.array)(Array_1.reverse(this.state.textCue), function (_a) {
                var _ = _a[0], n = _a[1];
                return n < _this.state.updateTime;
            })
                .map(function (val) { return React.createElement("div", { className: "text-cue", key: "textCue" }, val[0]); })
                .getOrElse(React.createElement("div", null)),
            React.createElement("div", { className: "vote-options" }, this.props.client.activeVote
                .map(function (av) { return av.vote; })
                .map(function (v) {
                return types_1.options(v).map(function (opt) {
                    return React.createElement(VoteOption_1.default, { key: opt[1], voteId: v.id, optionText: opt[0], voteChoice: opt[1], color: opt[2], vote: _this.state.cookie.map(function (c) { return _.partial(_this.props.thunkVote, c); })
                            .getOrElse(function () { return console.log("Couldn't vote no id"); }) });
                });
            })
                .getOrElse([React.createElement("div", { key: "empty" })]))));
    };
    return Client;
}(React.Component));
var mapStateToProps = function (state) { return ({
    client: state.client
}); };
exports.default = react_redux_1.connect(mapStateToProps, { thunkVote: thunks_1.thunkVote })(Client);
//# sourceMappingURL=Client.js.map