import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../store";
import { thunkVote } from "../thunks";
import CueVote from "./CueVote";
import { RouteComponentProps, RouteProps } from "react-router";
import { ClientState } from "../store/client/types";
import { Vote } from "../Vote";
import VoteOption from "./VoteOption";
import { IVote, VoteChoice, options } from "../../../types";
import { stat } from "fs";
import * as uuid from "uuid";
import { string } from "prop-types";
import * as _ from "lodash";
import { CookieStorage } from "cookie-storage";
import { none, fromNullable, Option } from "fp-ts/lib/Option";

interface ClientProps {
    client: ClientState;
    thunkVote: (userId: string, voteId: string, voteChoice: VoteChoice) => void;
}

class Client extends React.Component<ClientProps & RouteProps> {
    state: {cookie: Option<string>} = {
        cookie: none
    };

    componentDidMount() {
        const cookieStore = new CookieStorage();
        if (cookieStore.length === 0) {
            cookieStore.setItem("id", uuid.v4());
        }

        this.state.cookie = fromNullable(cookieStore.getItem("id"));
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
                            vote={this.state.cookie.map(c => _.partial(this.props.thunkVote, c))
                                .getOrElse(() => console.log("Couldn't vote no id"))}
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