import * as React from "react";
import { IVote, ActiveVote } from "../../../types";

interface ShowVoteOpProps {
    activeVote: ActiveVote;
    voteMap: {[key: string]: string};
}

const ShowVoteOp: React.FunctionComponent<ShowVoteOpProps> = ({ activeVote, voteMap }) => {
    return(
        <div className="vote-status">
            <h4>{activeVote.vote.text}</h4>
            {JSON.stringify(activeVote.voteMap)}
        </div>
    );
};


export default ShowVoteOp;