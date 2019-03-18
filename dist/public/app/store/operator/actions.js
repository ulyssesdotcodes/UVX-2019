"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
function cueVote(voteId) {
    return {
        type: types_1.CUE_VOTE,
        payload: voteId
    };
}
exports.cueVote = cueVote;
//# sourceMappingURL=actions.js.map