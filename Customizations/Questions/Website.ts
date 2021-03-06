import {UIElement} from "../../UI/UIElement";
import Translations from "../../UI/i18n/Translations";
import {TagRenderingOptions} from "../TagRenderingOptions";


export default class Website extends TagRenderingOptions {
    constructor(category: string | UIElement) {
        super({
            question: Translations.t.general.questions.websiteOf.Subs({category: category}),
            freeform: {
                renderTemplate: Translations.t.general.questions.websiteIs,
                template: "$$$",
                key: "website"
            }
        });
    }
}
