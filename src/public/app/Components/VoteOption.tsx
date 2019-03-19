import * as React from "react";
import { IVote, VoteChoice, voteResult } from "../../../types";

interface VoteOptionProps {
    voteId: string;
    optionText: string;
    voteChoice: VoteChoice;
    vote: (voteId: string, option: VoteChoice) => void;
}

const VoteOption: React.FunctionComponent<VoteOptionProps> =
({ voteId, optionText, vote, voteChoice }) => {
    function cue() {
        vote(voteId, voteChoice);
    }

    return(
        <div className="cue-vote">
            <button onClick={ cue }>{ optionText }</button>
        </div>
    );
};


export default VoteOption;