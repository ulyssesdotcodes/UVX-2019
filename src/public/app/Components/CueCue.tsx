import * as React from "react";
import { IVote, Cue } from "../../../types";
import { Option } from "fp-ts/lib/Option";

interface CueCueProps {
    cue: Cue;
    thunkCueCue: (cueId: string) => void;
}

const CueCue: React.FunctionComponent<CueCueProps> = ({ cue, thunkCueCue }) => {
    function cueCue() {
        thunkCueCue(cue.id);
    }

    return(
        <div className="cue-cue header">
            <a onClick={ cueCue } className="button">{ cue.id }</a>
        </div>
    );
};


export default CueCue;