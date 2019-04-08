"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var CueCue = function (_a) {
    var cue = _a.cue, thunkCueCue = _a.thunkCueCue, thunkDecueCue = _a.thunkDecueCue;
    function cueCue() {
        thunkCueCue(cue.id);
    }
    function decueCue() {
        thunkDecueCue(cue.id, undefined);
    }
    return (React.createElement("div", { className: "cue-cue header" },
        React.createElement("a", { onClick: cueCue, className: "button" }, cue.id),
        React.createElement("a", { onClick: decueCue, className: "decue" }, "X")));
};
exports.default = CueCue;
//# sourceMappingURL=CueCue.js.map