import * as React from "react";
import { IVote, VoteChoice } from "../../../types";

interface VoteOptionProps {
    voteId: string;
    optionText: string;
    voteChoice: VoteChoice;
    vote: (voteId: string, option: VoteChoice) => void;
    color: string;
}

const VoteOption: React.FunctionComponent<VoteOptionProps> =
({ voteId, optionText, vote, voteChoice, color }) => {
    function cue() {
        vote(voteId, voteChoice);
    }

    return(
        <div className="cue-vote">
            <a className={"vote-option button " + color} onClick={ cue }>{ optionText }</a>
        </div>
    );
};


export default VoteOption;