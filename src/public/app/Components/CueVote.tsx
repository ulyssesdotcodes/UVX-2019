import * as React from "react";
import { IVote } from "../../../types";

interface CueVoteProps {
    vote: IVote;
    cueVote: (voteId: string) => void;
}

const CueVote: React.FunctionComponent<CueVoteProps> = ({ vote, cueVote }) => {
    function cue() {
        cueVote(vote.id);
    }

    return(
        <div className="cue-vote">
            <button onClick={ cue }>{ vote.operatorName }</button>
        </div>
    );
};


export default CueVote;