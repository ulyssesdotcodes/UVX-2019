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
    var vote = _a.vote, cueVote = _a.cueVote;
    function cue() {
        cueVote(vote.id);
    }
    return (React.createElement("div", { className: "cue-vote" },
        React.createElement("button", { onClick: cue }, vote.operatorName)));
};
exports.default = CueVote;
//# sourceMappingURL=CueVote.js.map