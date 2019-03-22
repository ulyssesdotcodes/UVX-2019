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
var ShowVoteOp = function (_a) {
    var activeVote = _a.activeVote, voteMap = _a.voteMap;
    return (React.createElement("div", { className: "vote-status" },
        React.createElement("h4", null, activeVote.vote.text),
        JSON.stringify(activeVote.voteMap)));
};
exports.default = ShowVoteOp;
//# sourceMappingURL=ShowVoteOp.js.map