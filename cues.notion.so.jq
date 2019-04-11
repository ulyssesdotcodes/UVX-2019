def toms: 
    . | match("(([0-9]*)m)?(([0-9]*)s)?") | .captures 
    | ((if .[1].length > 0 then .[1].string | tonumber else 0 end) * 60 + 
        (if .[3].length > 0 then .[3].string | tonumber else 0 end)) * 1000;

[split("\n")[]
    | match("([a-zA-Z0-9]*\\.(mov|wav))\\s*-\\s*(audio|video)(\\s-)?\\s(.*)"; "g") 
    | [.captures[] | .string] | [.[0], .[2] + "Data", .[4]]
    | [
        {key: "id", value: .[0]}, 
        {key: .[1], value: true},
        {key: "file", value: .[0]},
        {key: "duration", value: .[2] | toms},
        {key: "showVoteIds", value: [["OPEN", "optionA"]]}
    ] | from_entries]