import { expect } from "chai";
import "mocha";

import * as S from "../src/state";
import * as T from "../src/types";

import * as TV from "./testvars";

import { fromNullable, some, none, Option } from "fp-ts/lib/Option";

describe("start vote", () => {
    const state = S.startVote(TV.defaultShowState, TV.showVote.id);

    it("should make a vote active", () => {
        expect(state.activeVote.map(av => av.vote)).to.deep.equal(some(TV.showVote));
    });
});

describe("end vote", () => {
    const state = S.endVote(T.defaultShowState);

    it("should make a vote inactive", () => {
        expect(state.activeVote).to.equal(none);
    });
});

describe("vote", () => {
    const novoteState = TV.defaultShowState;
    const novoteVotedState = S.vote(novoteState, TV.showVoteAction);
    const unvotedState = S.startVote(novoteState, TV.showVote.id);
    const state = S.vote(unvotedState, TV.showVoteAction);

    it("shouldn't do anything if there's no active vote", () => {
        expect(novoteVotedState.activeVote).to.equal(none);
    });

    it("should start with 0 votes", () => {
        expect(unvotedState.activeVote).to.not.equal(none);
        expect(unvotedState.activeVote.map(av => av.voteMap.size).getOrElse(-1)).to.equal(0);
    });

    it("should add to vote count", () => {
        expect(state.activeVote).to.not.be.null;
        expect(state.activeVote.map(av => av.voteMap.size).getOrElse(-1)).to.equal(1);
    });

    it("shouldn't allow the user to vote twice", () => {
        const votedTwiceState = S.vote(state, TV.showVoteActionB);
        expect(votedTwiceState.activeVote.map(av => av.voteMap.size).getOrElse(-1)).to.equal(1);
    });
});

describe("movie", () => {
    const state = S.runMovie(T.defaultShowState, TV.movie);

    it("should make a movie active", () => {
        expect(state.activeMovie).to.deep.equal(some(TV.movie));
    });
});

describe("run cue", () => {
    const state = S.runCue(T.defaultShowState, TV.allCue);
    const endTime = new Date().getTime() + TV.allCue.duration;

    it("should add a single cue to active cues", () => {
        expect(state.activeCues.length).equal(1);
        expect(state.activeCues).to.have.deep.members([[TV.allCue, endTime]]);
    });

    it("should clear inactive cues", () => {
        let changeTimeState = state;
        changeTimeState.activeCues[0][1] = new Date().getTime() - 1;
        changeTimeState = S.runCue(state, TV.textCue);
        expect(state.activeCues.length).to.equal(1);
    });
});