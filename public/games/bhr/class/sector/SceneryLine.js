import Line from "./Line.js";

export default class SceneryLine extends Line {
    type = "scenery";
    get hb() {
        return !0;
    }
}