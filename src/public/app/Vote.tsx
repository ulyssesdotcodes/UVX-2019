import * as React from "react";

export interface VoteProps { text: string; selected: boolean; }

export const Vote = (props: VoteProps) =>
    <h1 className={props.selected ? "selected" : "not-selected"}>
        {props.text}
    </h1>;