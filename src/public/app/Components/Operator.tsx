import * as React from "react";
import { connect } from "react-redux";
import { OperatorState } from "../store/operator/types";
import { AppState } from "../store";
import { thunkCueVote, connectws } from "../thunks";
import CueVote from "./CueVote";
import { RouteComponentProps, RouteProps, RouteChildrenProps } from "react-router";
import ShowVoteOp from "./ShowVoteOp";
import { VoteChoice, voteChoice } from "../../../types";
import { option, fromNullable } from "fp-ts/lib/Option";

interface OperatorProps {
    operator: OperatorState;
    thunkCueVote: (voteId: string) => void;
    connectws: (url: string) => void;
}

export type CueVoteParam = React.SyntheticEvent<{ value: string }>;

class Operator extends React.Component<OperatorProps & RouteChildrenProps, {activeVoteMap: {[key: string]: string}}> {
    state: {activeVoteMap: {[key: string]: string}} = {activeVoteMap: {}};

    componentDidMount() {
        this.props.connectws("ws://localhost:8080");
    }

    componentDidUpdate(prevProps: OperatorProps) {
        this.props.operator.activeVote.map(av =>
            Object.entries(av.voteMap).map(([k, v]) =>
            this.props.operator.activeVote.chain(av =>
            voteChoice(av.vote, v)
                .map(s => this.state.activeVoteMap[k] = s))));
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
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    operator: state.operator
});

export default connect(mapStateToProps, { thunkCueVote, connectws })(Operator);