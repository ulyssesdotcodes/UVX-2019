import * as React from "react";
import { IVote, voteChoice, VoteChoice } from "../../../types";
import { Option } from "fp-ts/lib/Option";

interface CueVoteProps {
    vote: IVote;
    voteResult: Option<VoteChoice>;
    cueVote: (voteId: string) => void;
}

const CueVote: React.FunctionComponent<CueVoteProps> = ({ vote, voteResult, cueVote }) => {
    function cue() {
        cueVote(vote.id);
    }

    return(
        <div className="cue-vote header">
            <a onClick={ cue } className="button">{ vote.operatorName }</a>
            {voteResult.chain(vr => voteChoice.getOption([vote, vr]))
                .map(vr => (<p className="vote-result">{vr}</p>))
                .getOrElse(<p className="vote-result"></p>)}
        </div>
    );
};


export default CueVote;