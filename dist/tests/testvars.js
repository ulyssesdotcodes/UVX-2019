"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Option_1 = require("fp-ts/lib/Option");
exports.showVote = { id: "testShow", text: "test", optionA: "test A", optionB: "test B", type: "show", operatorName: "test vote" };
exports.showVoteAction = { voteId: "testShow", userId: "testUser", vote: "optionA" };
exports.showVoteActionB = { voteId: "testShow", userId: "testUser", vote: "optionB" };
exports.filmVoteAction = { voteId: "testFilm", userId: "testUser", vote: "optionB" };
exports.movie = { batchFile: "test.mp4", batchLength: 10, loopFile: "testloop.mp4" };
exports.allCue = { text: "testAllCue", overlay: Option_1.some("overlay.mp4"), sound: Option_1.some("sound.mp4"), duration: 10 };
exports.textCue = { text: "testAllCue", overlay: Option_1.none, sound: Option_1.none, duration: 10 };
//# sourceMappingURL=testvars.js.map