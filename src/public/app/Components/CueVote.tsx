import * as React from "react";
import { IVote } from "../../../types";
import { Option } from "fp-ts/lib/Option";

interface CueVoteProps {
    vote: IVote;
    voteResult: Option<string>;
    cueVote: (voteId: string) => void;
}

const CueVote: React.FunctionComponent<CueVoteProps> = ({ vote, voteResult, cueVote }) => {
    function cue() {
        cueVote(vote.id);
    }

    return(
        <div className="cue-vote header">
            <a onClick={ cue } className="button">{ vote.operatorName }</a>
            {voteResult.map(vr => (<p className="vote-result">{vr}</p>))
                .getOrElse(<p className="vote-result">Not triggered yet</p>)}
        </div>
    );
};


export default CueVote;