import * as S from "../src/state";
import * as T from "../src/types";
import { some, none } from "fp-ts/lib/Option";
import { StrMap } from "fp-ts/lib/StrMap";

export const showVote: T.IShowVote = { id: "testShow", text: "test", optionA: "test A", optionAColor: "blue", optionB: "test B", optionBColor: "blue", type: "show", operatorName: "test vote" };
export const filmVote: T.FilmVote & T.IVotedFilmVote = { "id": "film-1",
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

export const dependentFilmVote: T.FilmVote = {
    "id": "film-3",
    "type": "film",
    "operatorName": "Cue dependent film vote",
    "prefix": "S5100",
    "extension": ".mov",
    "basis": ["film-1", "film-2"],
    "durations": {"12": 4},
    "defaultLoop": undefined
};

export const showVoteAction: T.IVoteAction = { voteId: "testShow", userId: "testUser", vote: "optionA" };
export const showVoteActionB: T.IVoteAction = { voteId: "testShow", userId: "testUser", vote: "optionB" };
export const showVoteActionUserB: T.IVoteAction = { voteId: "testShow", userId: "testUserB", vote: "optionB" };
export const filmVoteActionOptB: T.IVoteAction = { voteId: "testFilm", userId: "testUser", vote: "optionB" };

export const movie: T.IMovie = { batchFile: "test.mp4", batchLength: 10, loopFile: "testloop.mp4" };

export const textCue: T.TextCue = { id: "testall", textData: true,  text: [["testAllCue", 10]], showVoteIds: [[showVoteAction.voteId, "optionA"]] };
export const videoCue: T.VideoCue = { id: "testvideo", videoData: true, file: "test.mp4", showVoteIds: [], duration: 10000 };

export const defaultShowState: T.IShowState = { assetPath: "./", blackout: false, paused: some(new Date().getTime()), activeVote: none, activeCues: [], activeMovie: none, voteResults: { latest: none, latestShow: none, latestFilm: none, all: new StrMap<T.VoteChoice>({}) },
    filmVotes: [filmVote], showVotes: [showVote], cues: [textCue, videoCue] };

export const votedShowState: T.IShowState = {
    ...defaultShowState,
    ...{
        voteResuts: {
            latest: none,
            latestFilm: none,
            latestShow: none,
            all: new StrMap({ "film-1": "optionA", "film-2": "optionB" })
        },
        filmVotes: [dependentFilmVote]
    }
};
