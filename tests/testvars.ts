import * as S from "../src/state";
import * as T from "../src/types";
import { some, none } from "fp-ts/lib/Option";
export const showVote: T.IShowVote = { id: "testShow", text: "test", optionA: "test A", optionB: "test B", type: "show", operatorName: "test vote" };

export const defaultShowState: T.IShowState = { blackout: false, paused: true, activeVote: none, activeCues: [], activeMovie: none, voteResult: none,
    filmVotes: [], showVotes: [showVote] };

export const showVoteAction: T.IVoteAction = { voteId: "testShow", userId: "testUser", vote: "optionA" };
export const showVoteActionB: T.IVoteAction = { voteId: "testShow", userId: "testUser", vote: "optionB" };
export const filmVoteAction: T.IVoteAction = { voteId: "testFilm", userId: "testUser", vote: "optionB" };

export const movie: T.IMovie = { batchFile: "test.mp4", batchLength: 10, loopFile: "testloop.mp4" };

export const allCue: T.ICue = { text: "testAllCue", overlay: some("overlay.mp4"), sound: some("sound.mp4"), duration: 10 };
export const textCue: T.ICue = { text: "testAllCue", overlay: none, sound: none, duration: 10 };