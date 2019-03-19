import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../store";
import { thunkVote } from "../thunks";
import CueVote from "./CueVote";
import { RouteComponentProps, RouteProps } from "react-router";
import { ClientState } from "../store/client/types";
import { Vote } from "../Vote";
import VoteOption from "./VoteOption";
import { IFilmVote, IVote, VoteChoice, options } from "../../../types";

interface ClientProps {
    client: ClientState;
    thunkVote: (voteId: string, voteChoice: VoteChoice) => void;
    history?: any;
}

class Client extends React.Component<ClientProps & RouteProps> {
    state = {};

    componentDidMount() {
    }

    render() {
        return (
            <div className="client">
                {this.props.client.activeVote
                    .map(av => av.vote)
                    .map(v =>
                        options(v)
                        .map(opt =>
                        <VoteOption key={opt[1]}
                            voteId={v.id}
                            optionText={opt[0]}
                            voteChoice={opt[1]}
                            vote={this.props.thunkVote}
                            />))
                        .getOrElse([<div key="empty"></div>])}
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    client: state.client
});

export default connect(mapStateToProps, { thunkVote })(Client);