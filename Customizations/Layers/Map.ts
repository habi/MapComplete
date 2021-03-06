import {LayerDefinition} from "../LayerDefinition";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import {And, Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRenderingOptions";

export class Map extends LayerDefinition {
    constructor() {
        super("map");
        this.name = "Map";
        this.title = new FixedText("Map");
        this.minzoom = 12;

        this.overpassFilter = new Tag("information", "map");
        this.presets = [{
            title: "Map",
            tags: [new Tag("tourism", "information"), new Tag("information", "map")]
        }];


        const isOsmSource = new Tag("map_source", "OpenStreetMap");


        this.style = (properties) => {
            let icon = "assets/map.svg";
            if (isOsmSource.matchesProperties(properties)) {
                icon = "assets/osm-logo-white-bg.svg";
                
                const attr = properties["map_source:attribution"];
                if(attr == "sticker"){
                    icon = "assets/map-stickered.svg"
                }else if(attr == "no"){
                    icon = "assets/osm-logo-buggy-attr.svg"
                }
                
            }
            
            return {
                color: "#000000",
                icon: {
                    iconUrl: icon,
                    iconSize: [50, 50]
                }
            };
        }


        this.elementsToShow = [

            new ImageCarouselWithUploadConstructor(),

            new TagRenderingOptions({
                question: "Is this map based on OpenStreetMap?",
                mappings: [
                    {
                        k: isOsmSource,
                        txt: "This map is based on OpenStreetMap"
                    },
                ],
                freeform: {
                    key: "map_source",
                    renderTemplate: "The map data is based on {map_source}",
                    template: "The map data is based on $$$"
                }
            }),
            new TagRenderingOptions({
                question: "Is the attribution present?",
                mappings: [
                    {
                        k: new Tag("map_source:attribution", "yes"),
                        txt: "OpenStreetMap is clearly attributed, including the ODBL-license"
                    },
                    {
                        k: new Tag("map_source:attribution", "incomplete"),
                        txt: "OpenStreetMap is clearly attributed, but the license is not mentioned"
                    },
                    {
                        k: new Tag("map_source:attribution", "sticker"),
                        txt: "OpenStreetMap wasn't mentioned, but someone put an OpenStreetMap-sticker on it"
                    },
                    {
                        k: new Tag("map_source:attribution", "no"),
                        txt: "There is no attribution at all"
                    },
                    {
                        k: new Tag("map_source:attribution", "none"),
                        txt: "There is no attribution at all"
                    }
                ]
            }).OnlyShowIf(new Tag("map_source", "OpenStreetMap"))
        ]


    }
}