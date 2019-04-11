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
var types_1 = require("../../../types");
var StrMap_1 = require("fp-ts/lib/StrMap");
var CueCue_1 = __importDefault(require("./CueCue"));
var Operator = /** @class */ (function (_super) {
    __extends(Operator, _super);
    function Operator(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { activeVoteMap: {} };
        _this.go = _this.go.bind(_this);
        _this.pause = _this.pause.bind(_this);
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
                    return types_1.voteChoice.getOption([av.vote, v])
                        .map(function (s) { return _this.state.activeVoteMap[k] = s; });
                });
            });
        });
    };
    Operator.prototype.pause = function () {
        this.props.thunkChangePaused(true);
    };
    Operator.prototype.go = function () {
        this.props.thunkChangePaused(false);
    };
    Operator.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "operator" },
            React.createElement("div", { className: "all-votes" },
                React.createElement("div", { className: "cue-votes film-votes" },
                    React.createElement("div", { className: "header" }, "Film Votes"),
                    this.props.operator.filmVotes.map(function (v) {
                        return (React.createElement(CueVote_1.default, { key: v.id, vote: v, cueVote: _this.props.thunkCueVote, voteResult: StrMap_1.lookup(v.id, _this.props.operator.voteResults.all) }));
                    })),
                React.createElement("div", { className: "cue-votes show-votes" },
                    React.createElement("div", { className: "header" }, "Show Votes"),
                    this.props.operator.showVotes.map(function (v) {
                        return (React.createElement(CueVote_1.default, { key: v.id, vote: v, cueVote: _this.props.thunkCueVote, voteResult: StrMap_1.lookup(v.id, _this.props.operator.voteResults.all) }));
                    })),
                React.createElement("div", null,
                    React.createElement("div", { className: "header" }, "Cues"),
                    React.createElement("div", { className: "cue-list" }, types_1.activeCueList(this.props.operator.voteResults, this.props.operator.cues)
                        .map(function (c) {
                        return React.createElement(CueCue_1.default, { key: c.id + new Date().getTime(), cue: c, thunkCueCue: _this.props.thunkCueCue, thunkDecueCue: _this.props.thunkDecueCue });
                    })))),
            React.createElement("div", { className: "controls" },
                React.createElement("a", { className: "button", onClick: this.props.thunkEndVote }, "Early Vote Lock"),
                this.props.operator.paused.isSome() ?
                    React.createElement("a", { className: "button", onClick: this.go }, "Go") :
                    React.createElement("a", { className: "button", onClick: this.pause }, "Pause"),
                React.createElement("a", { className: "button", onClick: this.props.thunkCueBatch }, "Cue Batch"),
                React.createElement("a", { className: "button", onClick: this.props.thunkClearVoteResult }, "Clear Vote Result"),
                React.createElement("a", { className: "button", onClick: this.props.thunkReset }, "Reset"),
                React.createElement("a", { className: "button", onClick: this.props.thunkReloadData }, "Reload Data")),
            React.createElement("div", { className: "info" },
                React.createElement("h3", null, "Runtime Info"),
                this.props.operator.activeVote.map(function (av) { return (React.createElement("div", { className: "voteInfo", key: "activevote" },
                    React.createElement("p", null,
                        "Active Vote: ",
                        av.vote.operatorName,
                        " "),
                    React.createElement("p", null,
                        "Options: ",
                        av.vote.optionA,
                        ", ",
                        av.vote.optionB,
                        ", ",
                        types_1.votedFilmVote.getOption(av.vote).map(function (v) { return v.optionC; }).getOrElse(""),
                        " "))); }).getOrElse(React.createElement("div", null)),
                this.props.operator.activeMovie.map(function (mov) { return (React.createElement("div", { className: "movieFile", key: "activemovie" },
                    React.createElement("p", null,
                        "File: ",
                        mov.batchFile),
                    React.createElement("p", null,
                        "Loop: ",
                        mov.loopFile))); }).getOrElse(React.createElement("div", null)),
                React.createElement("div", { className: "cueInfo" },
                    "Cues:",
                    this.props.operator.activeCues.map(function (ac) { return (React.createElement("div", { key: ac[0].id + ac[1] },
                        React.createElement("span", null,
                            " ",
                            ac[0].id + " - " + ac[1],
                            " "),
                        React.createElement("a", { onClick: function () { return _this.props.thunkDecueCue(ac[0].id, ac[1]); }, className: "decue" }, "x"))); }))),
            React.createElement("div", { className: "cue-list" }, this.props.operator.cues
                .map(function (c) {
                return React.createElement(CueCue_1.default, { key: c.id, cue: c, thunkCueCue: _this.props.thunkCueCue, thunkDecueCue: _this.props.thunkDecueCue });
            }))));
    };
    return Operator;
}(React.Component));
var mapStateToProps = function (state) { return ({
    operator: state.operator
}); };
exports.default = react_redux_1.connect(mapStateToProps, { thunkCueVote: thunks_1.thunkCueVote, thunkChangePaused: thunks_1.thunkChangePaused, thunkCueBatch: thunks_1.thunkCueBatch, thunkEndVote: thunks_1.thunkEndVote, thunkCueCue: thunks_1.thunkCueCue, thunkDecueCue: thunks_1.thunkDecueCue, thunkReset: thunks_1.thunkReset, thunkClearVoteResult: thunks_1.thunkClearVoteResult, thunkReloadData: thunks_1.thunkReloadData, connectws: thunks_1.connectws })(Operator);
//# sourceMappingURL=Operator.js.map