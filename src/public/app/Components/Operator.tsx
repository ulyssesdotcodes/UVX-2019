import * as React from "react";
import { connect } from "react-redux";
import { OperatorState } from "../store/operator/types";
import { AppState } from "../store";
import { thunkCueVote, thunkChangePaused, thunkCueBatch, connectws } from "../thunks";
import CueVote from "./CueVote";
import { RouteComponentProps, RouteProps, RouteChildrenProps } from "react-router";
import ShowVoteOp from "./ShowVoteOp";
import { VoteChoice, voteChoice } from "../../../types";
import { option, fromNullable } from "fp-ts/lib/Option";

interface OperatorProps {
    operator: OperatorState;
    thunkCueVote: (voteId: string) => void;
    thunkChangePaused: (paused: boolean) => void;
    thunkCueBatch: () => void;
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
            voteChoice(av.vote, v)
                .map(s => this.state.activeVoteMap[k] = s.voteId))));
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
                {this.props.operator.activeVote.map(av =>
                <ShowVoteOp
                    key={"test"}
                    activeVote={av}
                    voteMap={this.state.activeVoteMap}
                    />
                ).getOrElse((<div></div>))}
                <div className="all-votes">
                    <div className="cue-votes film-votes">
                        <div className="header">Film Votes</div>
                        {this.props.operator.filmVotes.map(v =>
                            (<CueVote
                                key={v.id}
                                vote={v}
                                cueVote={this.props.thunkCueVote}
                                voteResult={fromNullable(this.props.operator.voteResults.get(v.id))}
                                />))}
                    </div>
                    <div className="cue-votes show-votes">
                        <div className="header">Show Votes</div>
                        {this.props.operator.showVotes.map(v =>
                            (<CueVote
                                key={v.id}
                                vote={v}
                                cueVote={this.props.thunkCueVote}
                                voteResult={fromNullable(this.props.operator.voteResults.get(v.id))}
                                />))}
                    </div>
                </div>
                <div className="controls">
                    <a className="button" onClick={this.go}>Go</a>
                    <a className="button" onClick={this.pause}>Pause</a>
                    <a className="button" onClick={this.props.thunkCueBatch}>Cue Batch</a>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    operator: state.operator
});

export default connect(mapStateToProps, { thunkCueVote, thunkChangePaused, thunkCueBatch, connectws })(Operator);