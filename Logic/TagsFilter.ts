
export abstract class TagsFilter {
    abstract matches(tags: { k: string, v: string }[]): boolean
    abstract asOverpass(): string[]
    abstract substituteValues(tags: any) : TagsFilter;

    matchesProperties(properties: any) : boolean{
        return this.matches(TagUtils.proprtiesToKV(properties));
    }
}


export class Regex extends TagsFilter {
    private _k: string;
    private _r: string;

    constructor(k: string, r: string) {
        super();
        this._k = k;
        this._r = r;
    }

    asOverpass(): string[] {
        return ["['" + this._k + "'~'" + this._r + "']"];
    }

    matches(tags: { k: string; v: string }[]): boolean {
        if(!(tags instanceof Array)){
            throw "You used 'matches' on something that is not a list. Did you mean to use 'matchesProperties'?"
        }
        
        for (const tag of tags) {
            if (tag.k === this._k) {
                if (tag.v === "") {
                    // This tag has been removed
                    return false;
                }
                if (this._r === "*") {
                    // Any is allowed
                    return true;
                }
                

                const matchCount =tag.v.match(this._r)?.length;
                return (matchCount ?? 0) > 0;
            }
        }
        return false;
    }

    substituteValues(tags: any) : TagsFilter{
        throw "Substituting values is not supported on regex tags"
    }
}


export class Tag extends TagsFilter {
    public key: string | RegExp
    public value: string | RegExp
    public invertValue: boolean

    constructor(key: string | RegExp, value: string | RegExp, invertValue = false) {
        if (value === "*" && invertValue) {
            throw new Error("Invalid combination: invertValue && value == *")
        }

        if (value instanceof RegExp && invertValue) {
            throw new Error("Unsupported combination: RegExp value and inverted value (use regex to invert the match)")
        }

        super()
        this.key = key
        this.value = value
        this.invertValue = invertValue
    }

    private static regexOrStrMatches(regexOrStr: string | RegExp, testStr: string) {
        if (typeof regexOrStr === 'string') {
            return regexOrStr === testStr
        } else if (regexOrStr instanceof RegExp) {
            return (regexOrStr as RegExp).test(testStr)
        }
        throw new Error("<regexOrStr> must be of type RegExp or string")
    }

    matches(tags: { k: string; v: string }[]): boolean {
        for (const tag of tags) {
            if (Tag.regexOrStrMatches(this.key, tag.k)) {
                if (tag.v === "") {
                    // This tag has been removed
                    return this.value === ""
                }
                if (this.value === "*") {
                    // Any is allowed
                    return true;
                }

                return Tag.regexOrStrMatches(this.value, tag.v) !== this.invertValue
            }
        }

        if (this.value === "") {
            return true
        }
        
        return this.invertValue
    }

    asOverpass(): string[] {
        const keyIsRegex = this.key instanceof RegExp
        const key = keyIsRegex ? (this.key as RegExp).source : this.key

        const valIsRegex = this.value instanceof RegExp
        const val = valIsRegex ? (this.value as RegExp).source : this.value

        const regexKeyPrefix = keyIsRegex ? '~' : ''
        const anyVal = this.value === "*"

        if (anyVal && !keyIsRegex) {
            return [`[${regexKeyPrefix}"${key}"]`];
        }
        if (this.value === "") {
            // NOT having this key
            return ['[!"' + key + '"]'];
        }

        const compareOperator = (valIsRegex || keyIsRegex) ? '~' : (this.invertValue ? '!=' : '=')
        return [`[${regexKeyPrefix}"${key}"${compareOperator}"${keyIsRegex && anyVal ? '.' : val}"]`];
    }

    substituteValues(tags: any) {
        if (typeof this.value !== 'string') {
            throw new Error("substituteValues() only possible with tag value of type string")
        }

        return new Tag(this.key, TagUtils.ApplyTemplate(this.value as string, tags));
    }
}


export function anyValueExcept(key: string, exceptValue: string) {
    return new And([
        new Tag(key, "*"),
        new Tag(key, exceptValue, true)
    ])
}


export class Or extends TagsFilter {
    public or: TagsFilter[]

    constructor(or: TagsFilter[]) {
        super();
        this.or = or;
    }

    matches(tags: { k: string; v: string }[]): boolean {
        for (const tagsFilter of this.or) {
            if (tagsFilter.matches(tags)) {
                return true;
            }
        }

        return false;
    }

    asOverpass(): string[] {
        const choices = [];
        for (const tagsFilter of this.or) {
            const subChoices = tagsFilter.asOverpass();
            for(const subChoice of subChoices){
                choices.push(subChoice)
            }
        }
        return choices;
    }

    substituteValues(tags: any): TagsFilter {
        const newChoices = [];
        for (const c of this.or) {
            newChoices.push(c.substituteValues(tags));
        }
        return new Or(newChoices);
    }
}


export class And extends TagsFilter {
    public and: TagsFilter[]

    constructor(and: TagsFilter[]) {
        super();
        this.and = and;
    }

    matches(tags: { k: string; v: string }[]): boolean {
        for (const tagsFilter of this.and) {
            if (!tagsFilter.matches(tags)) {
                return false;
            }
        }

        return true;
    }

    private combine(filter: string, choices: string[]): string[] {
        var values = []
        for (const or of choices) {
            values.push(filter + or);
        }
        return values;
    }

    asOverpass(): string[] {
        var allChoices: string[] = null;

        for (const andElement of this.and) {
            var andElementFilter = andElement.asOverpass();
            if (allChoices === null) {
                allChoices = andElementFilter;
                continue;
            }

            var newChoices: string[] = []
            for (var choice of allChoices) {
                newChoices.push(
                    ...this.combine(choice, andElementFilter)
                )
            }
            allChoices = newChoices;
        }
        return allChoices;
    }

    substituteValues(tags: any): TagsFilter {
        const newChoices = [];
        for (const c of this.and) {
            newChoices.push(c.substituteValues(tags));
        }
        return new And(newChoices);
    }
}


export class Not extends TagsFilter{
    private not: TagsFilter;
    
    constructor(not: TagsFilter) {
        super();
        this.not = not;
    }
    
    asOverpass(): string[] {
        throw "Not supported yet"
    }

    matches(tags: { k: string; v: string }[]): boolean {
        return !this.not.matches(tags);
    }

    substituteValues(tags: any): TagsFilter {
        return new Not(this.not.substituteValues(tags));
    }
}


export class TagUtils {
    static proprtiesToKV(properties: any): { k: string, v: string }[] {
        const result = [];
        for (const k in properties) {
            result.push({k: k, v: properties[k]})
        }
        return result;
    }

    static ApplyTemplate(template: string, tags: any): string {
        for (const k in tags) {
            while (template.indexOf("{" + k + "}") >= 0) {
                const escaped = tags[k].replace(/</g, '&lt;').replace(/>/g, '&gt;');
                template = template.replace("{" + k + "}", escaped);
            }
        }
        return template;
    }
}
