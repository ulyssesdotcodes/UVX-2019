import { expect } from "chai";
import "mocha";

import * as S from "../src/state";
import * as T from "../src/types";

import * as TV from "./testvars";

import { fromNullable, some, none, Option } from "fp-ts/lib/Option";
import { debug } from "util";
import { lookup, size } from "fp-ts/lib/StrMap";

describe("start vote", () => {
    const state = S.startVote(TV.showVote.id)(TV.defaultShowState);

    it("should make a vote active", () => {
        expect(state.activeVote.map(av => av.vote)).to.deep.equal(some(TV.showVote));
    });
});

describe("end vote", () => {
    const votestate = S.startVote(TV.showVote.id)(TV.defaultShowState);
    const votedstate = S.vote(TV.showVoteAction)(votestate);
    const state = S.endVote()(votedstate);

    it("should make a vote inactive", () => {
        expect(state.activeVote).to.equal(none);
    });

    it("should make the chosen option the result", () => {
        expect(state.voteResults.latest).to.not.equal(none);
        expect(state.voteResults.latest
            .chain(l => lookup(l, state.voteResults.all))
            .map(vr => vr === "optionA").getOrElse(false)).to.be.true;
    });

    it("should update the latest show vote", () => {
        expect(state.voteResults.latestShow).to.not.equal(none);
        expect(state.voteResults.latestShow
            .chain(l => lookup(l, state.voteResults.all))
            .map(vr => vr === "optionA").getOrElse(false)).to.be.true;
    });

    it("should update the latest film vote", () => {
        const filmVoteState = S.startVote(TV.filmVote.id)(state);
        const filmVotedState = S.vote(TV.filmVoteActionOptB)(filmVoteState);
        const stateF = S.endVote()(filmVotedState);
        expect(stateF.voteResults.latest
            .chain(l => lookup(l, stateF.voteResults.all))
            .map(vr => vr === "optionB").getOrElse(false)).to.be.true;

        expect(stateF.voteResults.latestFilm).to.not.equal(none);
        expect(stateF.voteResults.latestFilm
            .chain(l => lookup(l, stateF.voteResults.all))
            .map(vr => vr === "optionB").getOrElse(false)).to.be.true;

        expect(stateF.voteResults.latestShow).to.not.equal(none);
        expect(stateF.voteResults.latestShow
            .chain(l => lookup(l, stateF.voteResults.all))
            .map(vr => vr === "optionA").getOrElse(false)).to.be.true;
    });

    it("should add appropriate cues to the cue list", () => {
        expect(T.activeCueList(state.voteResults, state.cues)).to.not.equal(0);
        expect(T.findCue.at(TV.textCue.id).get(T.activeCueList(state.voteResults, state.cues)).map(_ => true).getOrElse(false)).to.be.true;
        expect(T.findCue.at(TV.videoCue.id).get(T.activeCueList(state.voteResults, state.cues)).map(_ => true).getOrElse(false)).to.be.false;
    });
});

describe("cue batch", () => {
    const votestate = S.startVote(TV.showVote.id)(TV.defaultShowState);
    const votedstate = S.vote(TV.showVoteAction)(votestate);
    const state = S.endVote()(votedstate);

    const filmvotestate = S.startVote(TV.filmVote.id)(TV.defaultShowState);
    const filmvotedstate = S.vote(TV.filmVoteActionOptB)(filmvotestate);
    const filmstate = S.endVote()(filmvotedstate);
    const filmstatecued = S.cueBatch()(filmstate);

    it("should make the chosen film active", () => {
        expect(filmstatecued.activeMovie).to.not.equal(none);
        expect(filmstatecued.activeMovie.map(am =>
            am.batchFile === TV.filmVote.optionBMovie.batchFile
            ).getOrElse(false)).to.be.true;
    });
});

describe("vote", () => {
    const novoteState = TV.defaultShowState;
    const novoteVotedState = S.vote(TV.showVoteAction)(novoteState);
    const unvotedState = S.startVote(TV.showVote.id)(novoteState);
    const state = S.vote(TV.showVoteAction)(unvotedState);

    it("shouldn't do anything if there's no active vote", () => {
        expect(novoteVotedState.activeVote).to.equal(none);
    });

    it("should start with 0 votes", () => {
        expect(unvotedState.activeVote).to.not.equal(none);
        expect(unvotedState.activeVote.map(av =>
            size(av.voteMap)).getOrElse(-1)).to.equal(0);
    });

    it("should add to vote count", () => {
        expect(state.activeVote).to.not.be.null;
        expect(state.activeVote
            .chain(av => lookup(TV.showVoteAction.userId, av.voteMap))
            .map(_ => true)
            .getOrElse(false)).to.be.true;
    });

    it("shouldn't allow the user to vote twice", () => {
        const votedTwiceState = S.vote(TV.showVoteActionB)(state);
        expect(votedTwiceState.activeVote.map(av => size(av.voteMap)).getOrElse(-1)).to.equal(1);
    });

    it("should add second vote to vote count", () => {
        const votedTwiceState = S.vote(TV.showVoteActionUserB)(state);
        expect(votedTwiceState.activeVote.map(av =>
            size(av.voteMap)).getOrElse(-1)).to.equal(2);
    });
});

describe("movie", () => {
    const state = S.runMovie(TV.defaultShowState, TV.movie);

    it("should make a movie active", () => {
        expect(state.activeMovie).to.deep.equal(some(TV.movie));
    });
});

describe("run cue", () => {
    const state = S.runCue(TV.textCue)(TV.defaultShowState);

    it("should add a single cue to active cues", () => {
        expect(state.activeCues.length).equal(1);
    });

    it("should clear inactive cues", () => {
        let changeTimeState = state;
        changeTimeState.activeCues[0][1] = new Date().getTime() - 1;
        changeTimeState = S.runCue(TV.textCue)(state);
        expect(state.activeCues.length).to.equal(1);
    });
});