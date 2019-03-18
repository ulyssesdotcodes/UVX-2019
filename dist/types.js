"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var monocle_ts_1 = require("monocle-ts");
var Option_1 = require("fp-ts/lib/Option");
exports.voteMap = monocle_ts_1.Lens.fromProp()("voteMap");
exports.blackout = monocle_ts_1.Lens.fromProp()("blackout");
exports.paused = monocle_ts_1.Lens.fromProp()("paused");
exports.activeCues = monocle_ts_1.Lens.fromProp()("activeCues");
exports.activeVote = monocle_ts_1.Optional.fromOptionProp()("activeVote");
exports.activeVoteLens = monocle_ts_1.Lens.fromProp()("activeVote");
exports.activeMovie = monocle_ts_1.Optional.fromOptionProp()("activeMovie");
exports.activeMovieLens = monocle_ts_1.Lens.fromProp()("activeMovie");
exports.voteResult = monocle_ts_1.Optional.fromOptionProp()("voteResult");
exports.defaultShowState = { blackout: false, paused: true, activeVote: Option_1.none, activeCues: [], activeMovie: Option_1.none, voteResult: Option_1.none, filmVotes: [], showVotes: [] };
//# sourceMappingURL=types.js.map