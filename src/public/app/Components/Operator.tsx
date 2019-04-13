import * as React from "react";
import { connect } from "react-redux";
import { OperatorState } from "../store/operator/types";
import { AppState } from "../store";
import { thunkCueVote, thunkChangePaused, thunkCueBatch, thunkEndVote, thunkCueCue, thunkDecueCue, thunkReset, thunkClearVoteResult, thunkReloadData, connectws } from "../thunks";
import CueVote from "./CueVote";
import { RouteComponentProps, RouteProps, RouteChildrenProps } from "react-router";
import ShowVoteOp from "./ShowVoteOp";
import { VoteChoice, voteChoice, activeCueList, isVotedFilmVote, votedFilmVote, cueAudioFile, Cue } from "../../../types";
import { option, fromNullable } from "fp-ts/lib/Option";
import { lookup } from "fp-ts/lib/StrMap";
import CueCue from "./CueCue";
import { sortBy } from "fp-ts/lib/Array";
import { contramap, ordString } from "fp-ts/lib/Ord";


interface OperatorProps {
    operator: OperatorState;
    thunkCueVote: (voteId: string) => void;
    thunkChangePaused: (paused: boolean) => void;
    thunkCueBatch: () => void;
    thunkEndVote: () => void;
    thunkCueCue: (cueId: string) => void;
    thunkDecueCue: (cueId: string, finishTime: number | undefined) => void;
    thunkReset: () => void;
    thunkReloadData: () => void;
    thunkClearVoteResult: () => void;
    connectws: (url: string) => void;
}

export type CueVoteParam = React.SyntheticEvent<{ value: string }>;

class Operator extends React.Component<OperatorProps, {activeVoteMap: {[key: string]: string}}> {
    state: {activeVoteMap: {[key: string]: string}} = {activeVoteMap: {}};

    constructor(props: OperatorProps) {
        super(props);

        this.go = this.go.bind(this);
        this.pause = this.pause.bind(this);
    }

    componentDidMount() {
        this.props.connectws("ws://localhost:8080");
    }

    componentDidUpdate(prevProps: OperatorProps) {
        this.props.operator.activeVote.map(av =>
            Object.entries(av.voteMap).map(([k, v]) =>
            this.props.operator.activeVote.chain(av =>
                voteChoice.getOption([av.vote, v])
                .map(s => this.state.activeVoteMap[k] = s))));
    }

    pause() {
        this.props.thunkChangePaused(true);
    }

    go() {
        this.props.thunkChangePaused(false);
    }

    render() {
        return (
            <div className="operator">
                <div className="all-votes">
                    <div className="cue-votes film-votes">
                        <div className="header">Film Votes</div>
                        {this.props.operator.filmVotes.map(v =>
                            (<CueVote
                                key={v.id}
                                vote={v}
                                cueVote={this.props.thunkCueVote}
                                voteResult={lookup(v.id, this.props.operator.voteResults.all)}
                                />))}
                    </div>
                    <div className="cue-votes show-votes">
                        <div className="header">Show Votes</div>
                        {this.props.operator.showVotes.map(v =>
                            (<CueVote
                                key={v.id}
                                vote={v}
                                cueVote={this.props.thunkCueVote}
                                voteResult={lookup(v.id, this.props.operator.voteResults.all)}
                                />))}
                    </div>
                    <div>
                        <div className="header">Cues</div>
                        <div className="cue-list">
                        {sortBy([contramap((c: Cue) => c.id, ordString)])
                            .map(v => v(activeCueList(this.props.operator.voteResults, this.props.operator.cues))
                            .map(c =>
                                <CueCue
                                    key={c.id}
                                    cue={c}
                                    thunkCueCue={this.props.thunkCueCue}
                                    thunkDecueCue={this.props.thunkDecueCue}
                                    />
                            )).getOrElse([<div></div>])}
                        </div>
                    </div>
                </div>

                <div className="controls">
                    <a className="button" onClick={this.props.thunkEndVote}>Early Vote Lock</a>
                    {this.props.operator.paused.isSome() ?
                        <a className="button" onClick={this.go}>Go</a> :
                        <a className="button" onClick={this.pause}>Pause</a>
                    }
                    <a className="button" onClick={this.props.thunkCueBatch}>Cue Batch</a>
                    <a className="button" onClick={this.props.thunkClearVoteResult}>Clear Vote Result</a>
                    <a className="button" onClick={this.props.thunkReset}>Reset</a>
                    <a className="button" onClick={this.props.thunkReloadData}>Reload Data</a>
                </div>
                <div className="info">
                    <h3>Runtime Info</h3>
                    {this.props.operator.activeVote.map(av => (
                        <div className="voteInfo" key="activevote">
                            <p>Active Vote: {av.vote.operatorName} </p>
                            <p>Options: {av.vote.optionA}, {av.vote.optionB}, {votedFilmVote.getOption(av.vote).map(v => v.optionC).getOrElse("")} </p>
                        </div>
                    )).getOrElse(<div></div>)}
                    {this.props.operator.activeMovie.map(mov => (
                        <div className="movieFile" key="activemovie">
                            <p>File: {mov.batchFile}</p>
                            <p>Loop: {mov.loopFile}</p>
                        </div>
                    )).getOrElse(<div></div>)}
                    <div className="cueInfo">
                        Cues:
                        {this.props.operator.activeCues.map(ac => (
                            <div key={ac[0].id + ac[1]}>
                                <span> {ac[0].id + " - " + ac[1]} </span>
                                <a onClick={ () => this.props.thunkDecueCue(ac[0].id, ac[1]) } className="decue">x</a>
                            </div>
                        ))}
                    </div>

                </div>
                <div className="cue-list-vert">
                    {sortBy([contramap((c: Cue) => c.id, ordString)]).map(v => v(this.props.operator.cues)
                        .map(c =>
                            <CueCue
                                key={c.id}
                                cue={c}
                                thunkCueCue={this.props.thunkCueCue}
                                thunkDecueCue={this.props.thunkDecueCue}
                                />
                        )).getOrElse([<div></div>])}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    operator: state.operator
});

export default connect(mapStateToProps, { thunkCueVote, thunkChangePaused, thunkCueBatch, thunkEndVote, thunkCueCue, thunkDecueCue, thunkReset, thunkClearVoteResult, thunkReloadData, connectws })(Operator);