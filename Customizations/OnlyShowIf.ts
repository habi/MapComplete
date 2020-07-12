/**
 * Wrapper around another TagDependandElement, which only shows if the filters match
 */
import {TagDependantUIElement, TagDependantUIElementConstructor} from "./UIElementConstructor";
import {TagsFilter, TagUtils} from "../Logic/TagsFilter";
import {UIElement} from "../UI/UIElement";
import {UIEventSource} from "../UI/UIEventSource";
import {Changes} from "../Logic/Changes";


export class OnlyShowIfConstructor implements TagDependantUIElementConstructor{
    private _tagsFilter: TagsFilter;
    private _embedded: TagDependantUIElementConstructor;
    
    constructor(tagsFilter : TagsFilter, embedded: TagDependantUIElementConstructor) {
        this._tagsFilter = tagsFilter;
        this._embedded = embedded;
    }

    construct(tags: UIEventSource<any>, changes: Changes): TagDependantUIElement {
        return new OnlyShowIf(tags, 
            this._embedded.construct(tags, changes),
            this._tagsFilter);
    }
    
    
}

class OnlyShowIf extends UIElement implements TagDependantUIElement {
    private _embedded: TagDependantUIElement;
    private _filter: TagsFilter;

    constructor(
        tags: UIEventSource<any>,
        embedded: TagDependantUIElement, filter: TagsFilter) {
        super(tags);
        this._filter = filter;
        this._embedded = embedded;

    }
    
    private Matches() : boolean{
        return this._filter.matches(TagUtils.proprtiesToKV(this._source.data));
    } 

    protected InnerRender(): string {
        if (this.Matches()) {
            return this._embedded.Render();
        } else {
            return "";
        }
    }

    Priority(): number {
        return this._embedded.Priority();
    }

    IsKnown(): boolean {
        if(!this.Matches()){
            return false;
        }
        return this._embedded.IsKnown();
    }

    IsQuestioning(): boolean {
        if(!this.Matches()){
            return false;
        }
        return this._embedded.IsQuestioning();
    }

    Activate(): void {
        this._embedded.Activate();
    }

    Update(): void {
        this._embedded.Update();
    }
}