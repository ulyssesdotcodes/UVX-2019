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
            <button onClick={ cue }>{ vote.operatorName }</button>
            {voteResult.map(vr => (<p>vr</p>))
                .getOrElse(<p>Not triggered yet</p>)}
        </div>
    );
};


export default CueVote;