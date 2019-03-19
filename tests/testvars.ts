import * as S from "../src/state";
import * as T from "../src/types";
import { some, none } from "fp-ts/lib/Option";
export const showVote: T.IShowVote = { id: "testShow", text: "test", optionA: "test A", optionB: "test B", type: "show", operatorName: "test vote" };
export const filmVote: T.IFilmVote = { "id": "film-1",
            "type": "film",
            "text": "First film vote!",
            "operatorName": "Cue first film vote",
            "optionA": "Test Af",
            "optionAMovie": {
                "batchFile": "video/optionA.mp4",
                "batchLength": 10000,
                "loopFile": "video/optionAloop.mp4"
            },
            "optionB": "Test Bf",
            "optionBMovie": {
                "batchFile": "video/optionB.mp4",
                "batchLength": 10000,
                "loopFile": "video/optionBloop.mp4"
            },
            "optionC": "Test Cf",
            "optionCMovie": {
                "batchFile": "video/optionC.mp4",
                "batchLength": 10000,
                "loopFile": "video/optionCloop.mp4"
            }};

export const defaultShowState: T.IShowState = { blackout: false, paused: true, activeVote: none, activeCues: [], activeMovie: none, voteResult: none,
    filmVotes: [filmVote], showVotes: [showVote] };

export const showVoteAction: T.IVoteAction = { voteId: "testShow", userId: "testUser", vote: "optionA" };
export const showVoteActionB: T.IVoteAction = { voteId: "testShow", userId: "testUser", vote: "optionB" };
export const filmVoteActionOptB: T.IVoteAction = { voteId: "testFilm", userId: "testUser", vote: "optionB" };

export const movie: T.IMovie = { batchFile: "test.mp4", batchLength: 10, loopFile: "testloop.mp4" };

export const allCue: T.ICue = { text: "testAllCue", overlay: some("overlay.mp4"), sound: some("sound.mp4"), duration: 10 };
export const textCue: T.ICue = { text: "testAllCue", overlay: none, sound: none, duration: 10 };
