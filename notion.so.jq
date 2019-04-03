
def toms: 
    . | [(split(":")[] | tonumber)] as $batchLength 
    | ($batchLength[0] * 60 * 1000) + ($batchLength[1] * 1000) + ($batchLength[2] / 24 * 1000)
    | floor;

[[.recordMap.block[].value | select(.parent_id == "c8a32970-6f05-422d-9c12-441e0e7b9404")] |
    group_by(.properties["jv[b"])[]
    | .[0].properties["jv[b"][0][0] as $batchnum 
    | if $batchnum == "6 Scene 51" then 
    {
        id: "film-\($batchnum)",
        type: "film",
        operatorName: "Cue \($batchnum)",
        prefix: "video/S5100",
        extension: ".mov",
        basis: ["film-3", "film-4", "film-5"],
        durations: [.[] | {key: .properties["2JDb"][0][0][-3:], value: .properties["VeMj"][0][0] | toms}] 
            | from_entries 
    } 
    elif $batchnum == "2" then 
    {
        id: "film-\($batchnum)",
        type: "film",
        operatorName: "Cue \($batchnum)",
        prefix: "video/B20",
        extension: ".mov",
        basis: [],
        durations: {"": .[0].properties["VeMj"][0][0] | toms}
    } 
    elif $batchnum == "7" then 
    {
        id: "film-\($batchnum)",
        type: "film",
        operatorName: "Cue \($batchnum)",
        prefix: "video/B700",
        extension: ".mov",
        basis: ["film-3", "film-4", "film-5", "film-6 b"],
        durations: [.[] | {
            key: .properties["2JDb"][0][0][-4:], 
            value: .properties["VeMj"][0][0] | toms
            }] | from_entries 
    } 
    elif $batchnum == "6 b" then 
    {
        id: "film-\($batchnum)",
        type: "film",
        operatorName: "Cue \($batchnum)",
        prefix: "video/B6b",
        extension: ".mov",
        basis: ["film-6 a"],
        durations: {
            "1": .[2].properties["VeMj"][0][0] | toms,
            "2": .[0].properties["VeMj"][0][0] | toms,
            "3": .[1].properties["VeMj"][0][0] | toms
        }
    } 
    else
    { 
        id: "film-\($batchnum)", 
        type: "film", 
        text: "Vote \($batchnum)",
        operatorName: "Cue \($batchnum)",
        optionA: .[0].properties["title"][0][0],
        optionAMovie: {
            batchFile:"video/\(.[0].properties["2JDb"][0][0]).mov",
            batchLength: (.[0].properties["VeMj"][0][0] | toms),
            loopFile: "video/\(.[0].properties["2JDb"][0][0])_loop.mov"
        },
        
      } + (if .[1] then 
        {optionB: .[1].properties["title"][0][0],
        optionBMovie: {
            batchFile:"video/\(.[1].properties["2JDb"][0][0]).mov",
            batchLength: (.[1].properties["VeMj"][0][0] | toms),
            loopFile: "video/\(.[1].properties["2JDb"][0][0])_loop.mov"
        }} else {} end)
        + (if .[2] then
        {optionC: .[2].properties["title"][0][0],
        optionCMovie: {
            batchFile:"video/\(.[2].properties["2JDb"][0][0]).mov",
            batchLength: (.[2].properties["VeMj"][0][0] | toms),
            loopFile: "video/\(.[2].properties["2JDb"][0][0])_loop.mov"
        }} else {} end) end
]