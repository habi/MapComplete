import {LayerDefinition} from "../LayerDefinition";
import {Tag} from "../../Logic/TagsFilter";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import {TagRenderingOptions} from "../TagRenderingOptions";

export class GhostBike extends LayerDefinition {
    constructor() {
        super("ghost bike");
        this.name = "Ghost bike";
        this.overpassFilter = new Tag("memorial", "ghost_bike")
        this.title = new FixedText("Ghost bike");
        this.description = "A <b>ghost bike</b> is a memorial for a cyclist who died in a traffic accident," +
            " in the form of a white bicycle placed permanently near the accident location.";

        this.minzoom = 1;
        this.icon = "./assets/bike/ghost.svg"
        this.presets = [
            {
                title: "Ghost bike",
                description: "Add a missing ghost bike to the map",
                tags: [new Tag("historic", "memorial"), new Tag("memorial", "ghost_bike")]
            }
        ]

        this.elementsToShow = [
            new FixedText(this.description),
            new ImageCarouselWithUploadConstructor(),

            new TagRenderingOptions({
                question: "Whom is remembered by this ghost bike?" +
                    "<span class='question-subtext'>" +
                    "<br/>" +
                    "Please respect privacy - only fill out the name if it is widely published or marked on the cycle." +
                    "</span>",
                mappings: [{k: new Tag("noname", "yes"), txt: "There is no name marked on the bike"},],
                freeform: {
                    key: "name",
                    extraTags: new Tag("noname", ""),
                    template: "$$$",
                    renderTemplate: "In the remembrance of <b>{name}</b>",
                }
            }),
            new TagRenderingOptions({
                question: "When was the ghost bike installed?",
                freeform: {
                    key: "start_date",
                    template: "The ghost bike was placed on $$$", // TODO create a date picker
                    renderTemplate: "The ghost bike was placed on <b>{start_date}</b>",
                }
            }),
            new TagRenderingOptions({
                question: "On what URL can more information be found?" +
                    "<span class='question-subtext'>If available, add a link to a news report about the accident or about the placing of the ghost bike</span>",
                freeform: {
                    key: "source",
                    template: "More information available on $$$",
                    renderTemplate: "<a href='{source}' target='_blank'>More information</a>",
                }
            }),

            

        ];

        this.style =  (tags: any) => {
            return {
                color: "#000000",
                icon: {
                    iconUrl: 'assets/bike/ghost.svg',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                }
            }
        };

    }
}
