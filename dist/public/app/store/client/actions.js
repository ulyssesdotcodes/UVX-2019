"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
function vote(voteAction) {
    return {
        type: types_1.VOTE,
        payload: voteAction
    };
}
exports.vote = vote;
//# sourceMappingURL=actions.js.map