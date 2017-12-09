class BaseProcessInstruction {
    constructor(name, synonims, defaultProperty, help) {
        this._name = name || "";
        this._synonims = synonims || {};
        this._defaultProperty = defaultProperty || {};
        this._help = help || {};
    }

    execute(command, state, config) {
        return new Promise(function (resolve, reject) {
            reject(new Error("Not implemented"));
        });
    }

    //region getter/setter
    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name || "";
    }

    get synonims() {
        return this._synonims;
    }

    set synonims(synonims) {
        this._synonims = synonims || {};
    }

    get defaultProperty() {
        return this._defaultProperty;
    }

    set defaultProperty(defaultProperty) {
        this._defaultProperty = defaultProperty || {};
    }

    get help() {
        return this._help;
    }

    set help(help) {
        this._help = help || {};
    }

    //endregion
}

module.exports = BaseProcessInstruction;