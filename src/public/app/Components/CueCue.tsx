import * as React from "react";
import { IVote, Cue } from "../../../types";
import { Option } from "fp-ts/lib/Option";

interface CueCueProps {
    cue: Cue;
    thunkCueCue: (cueId: string) => void;
    thunkDecueCue: (cueId: string, finishTime: number | undefined) => void;
}

const CueCue: React.FunctionComponent<CueCueProps> = ({ cue, thunkCueCue, thunkDecueCue }) => {
    function cueCue() {
        thunkCueCue(cue.id);
    }

    function decueCue() {
        thunkDecueCue(cue.id, undefined);
    }

    return(
        <div className="cue-cue header">
            <a onClick={ cueCue } className="button">{ cue.id }</a>
            <a onClick={ decueCue } className="decue">X</a>
        </div>
    );
};


export default CueCue;