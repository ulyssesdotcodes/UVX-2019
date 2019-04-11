import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../store";
import { thunkVote } from "../thunks";
import CueVote from "./CueVote";
import { RouteComponentProps, RouteProps } from "react-router";
import { ClientState } from "../store/client/types";
import { Vote } from "../Vote";
import VoteOption from "./VoteOption";
import { IVote, VoteChoice, options, isTextCue, TextCue, Cue, ActiveCue, cueAudioFile } from "../../../types";
import { stat } from "fs";
import * as uuid from "uuid";
import { string } from "prop-types";
import * as _ from "lodash";
import { CookieStorage } from "cookie-storage";
import { none, fromNullable, Option, option, getSetoid, tryCatch, some } from "fp-ts/lib/Option";
import { array, last, cons, head, zip, unzip, filter, snoc, reverse, scanLeft, scanRight } from "fp-ts/lib/Array";
import { flip, curry, Predicate, compose } from "fp-ts/lib/function";
import { findFirst } from "fp-ts/lib/Foldable2v";
import { traceM } from "fp-ts/lib/Trace";
import { setoidString, getArraySetoid, getTupleSetoid, setoidNumber } from "fp-ts/lib/Setoid";

interface ClientProps {
    client: ClientState;
    thunkVote: (userId: string, voteId: string, voteChoice: VoteChoice) => void;
}

interface ComponentState {
    cookie: Option<string>;
    textCueIdx: Option<number>;
    textCue: [string, number][];
    updateTime: number;
}

class Client extends React.Component<ClientProps & RouteProps> {
    state: ComponentState = {
        cookie: none,
        textCueIdx: none,
        textCue: [],
        updateTime: new Date().getTime()
    };

    constructor(props: ClientProps) {
        super(props);
        setInterval(() => this.setState({...this.state, ...{ updateTime: new Date().getTime() }}), 500);
    }

    componentDidMount() {
        const cookieStore = new CookieStorage();
        if (cookieStore.length === 0) {
            cookieStore.setItem("id", uuid.v4());
        }

        this.state.cookie = fromNullable(cookieStore.getItem("id"));
        this.state.textCue =
            head(filter<[Cue, number], [TextCue, number]>(this.props.client.activeCues, (cn): cn is [TextCue, number] => isTextCue(cn[0])))
                .map(([tc, n]) => zip(unzip(tc.text)[0], scanRight(unzip(tc.text)[1], n, (b, a) => b - a)))
                .getOrElse([]);
    }

    componentDidUpdate(prevProps: ClientProps, prevState: ComponentState) {
        const textCue =
            head(filter<[Cue, number], [TextCue, number]>(this.props.client.activeCues, (cn): cn is [TextCue, number] => isTextCue(cn[0])))
                .map(([tc, n]) => zip(unzip(tc.text)[0], scanRight(unzip(tc.text)[1], n, (a, b) => b - a)))
                .getOrElse([]);

        if (!getArraySetoid(getTupleSetoid(setoidString, setoidNumber)).equals(textCue, prevState.textCue)) {
            this.setState({
                ...this.state,
                ...{ textCue }
            });
        }

    }

    render() {
        return (
            <div className="client">
                { findFirst(array)(reverse(this.state.textCue), ([_, n]) => n < this.state.updateTime)
                    .map(val => <div className="text-cue" key="textCue">{ val[0] }</div>)
                    .getOrElse(<div></div>)
                }
                <div className="vote-options">
                    {this.props.client.activeVote
                        .map(av => av.vote)
                        .map(v =>
                            options(v).map(opt =>
                                <VoteOption key={opt[1]}
                                    voteId={v.id}
                                    optionText={opt[0]}
                                    voteChoice={opt[1]}
                                    color={opt[2]}
                                    vote={this.state.cookie.map(c => _.partial(this.props.thunkVote, c))
                                        .getOrElse(() => console.log("Couldn't vote no id"))}
                                    />))
                            .getOrElse([<div key="empty"></div>])}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    client: state.client
});

export default connect(mapStateToProps, { thunkVote })(Client);