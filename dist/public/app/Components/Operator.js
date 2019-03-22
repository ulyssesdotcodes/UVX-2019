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
var CueVote_1 = __importDefault(require("./CueVote"));
var ShowVoteOp_1 = __importDefault(require("./ShowVoteOp"));
var types_1 = require("../../../types");
var Option_1 = require("fp-ts/lib/Option");
var Operator = /** @class */ (function (_super) {
    __extends(Operator, _super);
    function Operator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { activeVoteMap: {} };
        return _this;
    }
    Operator.prototype.componentDidMount = function () {
        this.props.connectws("ws://localhost:8080");
    };
    Operator.prototype.componentDidUpdate = function (prevProps) {
        var _this = this;
        this.props.operator.activeVote.map(function (av) {
            return Object.entries(av.voteMap).map(function (_a) {
                var k = _a[0], v = _a[1];
                return _this.props.operator.activeVote.chain(function (av) {
                    return types_1.voteChoice(av.vote, v)
                        .map(function (s) { return _this.state.activeVoteMap[k] = s; });
                });
            });
        });
    };
    Operator.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "operator" },
            this.props.operator.activeVote.map(function (av) {
                return React.createElement(ShowVoteOp_1.default, { key: "test", activeVote: av, voteMap: _this.state.activeVoteMap });
            }).getOrElse((React.createElement("div", null))),
            React.createElement("div", { className: "all-votes" },
                React.createElement("div", { className: "cue-votes film-votes" },
                    React.createElement("div", { className: "header" }, "Film Votes"),
                    this.props.operator.filmVotes.map(function (v) {
                        return (React.createElement(CueVote_1.default, { key: v.id, vote: v, cueVote: _this.props.thunkCueVote, voteResult: Option_1.fromNullable(_this.props.operator.voteResults.get(v.id)) }));
                    })),
                React.createElement("div", { className: "cue-votes show-votes" },
                    React.createElement("div", { className: "header" }, "Show Votes"),
                    this.props.operator.showVotes.map(function (v) {
                        return (React.createElement(CueVote_1.default, { key: v.id, vote: v, cueVote: _this.props.thunkCueVote, voteResult: Option_1.fromNullable(_this.props.operator.voteResults.get(v.id)) }));
                    })))));
    };
    return Operator;
}(React.Component));
var mapStateToProps = function (state) { return ({
    operator: state.operator
}); };
exports.default = react_redux_1.connect(mapStateToProps, { thunkCueVote: thunks_1.thunkCueVote, connectws: thunks_1.connectws })(Operator);
//# sourceMappingURL=Operator.js.map