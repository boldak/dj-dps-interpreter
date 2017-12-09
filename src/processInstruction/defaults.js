const BaseProcessInstruction = require("./baseProcessInstruction");
const Promise = require("bluebird");

let defaults = new BaseProcessInstruction("@defaults");

defaults.synonims = {
    "@def": "@defaults",
    "@use": "@defaults"
};

defaults["internal aliases"] = {
    "packages": "packages"
};

defaults.defaultProperty = {
    "@defaults": "packages",
    "@def": "packages",
    "@use": "packages"
};

defaults.help = {
    synopsis: "Process instruction set usage of defaults packages ",

    name: {
        "default": "@defaults",
        synonims: []
    },

    "default param": "promise",

    input: ["string"],

    output: "Promise",

    params: [{
        name: "promises",
        synopsis: "Array of async code promises thats must be resolved",
        type: ["array of promises", "bindable"],
        synonims: ["promises", "branches"],
        "default value": "undefined"
    }],

    example: {
        description: "Execute async codes",
        code: "@async(promise:'p[0]')\n<?json\n{\"index\":0}\n?>\nset('data')\n@sync(vars:['data[0]'], values:['data'])\n\n@async(promise:'p[1]')\n<?json\n{\"index\":1}\n?>\nset('data')\n@sync(vars:['data[1]'], values:['data'])\n@all({{p}})\nget('data')\n"
    }
};

defaults.execute = function (command, state, config) {
    // console.log("@defaults", command)
    return new Promise(function (resolve, reject) {


        state.packages = (command.settings.packages)
            ? !util.isArray(command.settings.packages)
                ? [command.settings.packages]
                : command.settings.packages
            : undefined;


        resolve(state)
    })
};

module.exports = defaults;