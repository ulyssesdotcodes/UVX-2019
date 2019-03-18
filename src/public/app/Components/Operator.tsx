import * as React from "react";
import { connect } from "react-redux";
import { OperatorState } from "../store/operator/types";
import { AppState } from "../store";
import { thunkCueVote, connectws } from "../thunks";
import CueVote from "./CueVote";

interface OperatorProps {
    operator: OperatorState;
    thunkCueVote: (voteId: string) => void;
    connectws: (url: string) => void;
}

export type CueVoteParam = React.SyntheticEvent<{ value: string }>;

class Operator extends React.Component<OperatorProps> {
    state = {};

    componentDidMount() {
        this.props.connectws("ws://localhost:8080");
    }

    render() {
        return (
            <div className="operator">
                {this.props.operator.filmVotes.map(v => (<CueVote key={v.id} vote={v} cueVote={this.props.thunkCueVote} />))}
                {this.props.operator.showVotes.map(v => (<CueVote key={v.id} vote={v} cueVote={this.props.thunkCueVote} />))}
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    operator: state.operator
});

export default connect(mapStateToProps, { thunkCueVote, connectws })(Operator);