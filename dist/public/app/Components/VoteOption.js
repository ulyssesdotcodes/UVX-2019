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
var VoteOption = function (_a) {
    var voteId = _a.voteId, optionText = _a.optionText, vote = _a.vote, voteChoice = _a.voteChoice, color = _a.color;
    function cue() {
        vote(voteId, voteChoice);
    }
    return (React.createElement("div", { className: "cue-vote" },
        React.createElement("a", { className: "vote-option button " + color, onClick: cue }, optionText)));
};
exports.default = VoteOption;
//# sourceMappingURL=VoteOption.js.map