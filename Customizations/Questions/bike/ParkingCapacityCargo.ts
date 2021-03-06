import Translations from "../../../UI/i18n/Translations";
import Combine from "../../../UI/Base/Combine";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class ParkingCapacityCargo extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.parking.capacity_cargo
        super({
            priority: 10,
            question: to.question,
            freeform: {
                key: "capacity:cargo_bike",
                renderTemplate: to.render,
                template: to.template
            }
        });
    }
}
