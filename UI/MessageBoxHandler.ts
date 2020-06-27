/**
 * Keeps 'messagebox' and 'messageboxmobile' in sync, shows a 'close' button on the latter one
 */
import {UIEventSource} from "./UIEventSource";
import {UIElement} from "./UIElement";
import {FixedUiElement} from "./FixedUiElement";
import {VariableUiElement} from "./VariableUIElement";

export class MessageBoxHandler {
    private _uielement: UIEventSource<() => UIElement>;

    constructor(uielement: UIEventSource<() => UIElement>,
                onClear: (() => void)) {
        this._uielement = uielement;
        this.listenTo(uielement);
        this.update();

        new VariableUiElement(new UIEventSource<string>("<h2>Naar de kaart > </h2>"),
            (htmlElement) => {
                htmlElement.onclick = function () {
                    uielement.setData(undefined);
                    onClear();
                }
            }
        ).AttachTo("to-the-map");

    }

    listenTo(uiEventSource: UIEventSource<any>) {
        const self = this;
        uiEventSource.addCallback(function () {
            self.update();
        })
    }

    update() {
        const wrapper = document.getElementById("messagesboxmobilewrapper");
        const gen = this._uielement.data;
        console.log("Generator: ", gen);
        if (gen === undefined) {
            wrapper.classList.add("hidden");
            return;
        }
        wrapper.classList.remove("hidden");
        gen()
            ?.HideOnEmpty(true)
            ?.AttachTo("messagesbox")
            ?.Activate();

        gen()
            ?.HideOnEmpty(true)
            ?.AttachTo("messagesboxmobile")
            ?.Activate();


    }

}