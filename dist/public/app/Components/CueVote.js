"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var CueVote = function (_a) {
    var vote = _a.vote, voteResult = _a.voteResult, cueVote = _a.cueVote;
    function cue() {
        cueVote(vote.id);
    }
    return (React.createElement("div", { className: "cue-vote header" },
        React.createElement("button", { onClick: cue }, vote.operatorName),
        voteResult.map(function (vr) { return (React.createElement("p", null, "vr")); })
            .getOrElse(React.createElement("p", null, "Not triggered yet"))));
};
exports.default = CueVote;
//# sourceMappingURL=CueVote.js.map