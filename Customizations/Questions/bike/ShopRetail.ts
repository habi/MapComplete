import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class ShopRetail extends TagRenderingOptions {
    constructor() {
        const key = 'service:bicycle:retail'
        const to = Translations.t.cyclofix.shop.retail
        super({
            question: to.question,
            mappings: [
                {k: new Tag(key, "yes"), txt: to.yes},
                {k: new Tag(key, "no"), txt: to.no},
            ]
        });
    }
}
