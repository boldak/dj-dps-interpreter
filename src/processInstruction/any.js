const BaseProcessInstruction = require("./baseProcessInstruction");
const Promise = require("bluebird");
const util = require("util");

let any = new BaseProcessInstruction("@any");
any.synonims = {};

any["internal aliases"] = {
    "promises": "promises",
    "branches": "promises",
};

any.defaultProperty = {
    "@any": "promises"
};

any.help = {
    synopsis: "Process instruction waits ANY selected async codes",

    name: {
        "default": "@any",
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

any.execute = function (command, state, config) {
    // console.log("@any")
    return new Promise(function (resolve, reject) {
        let promises = command.settings.promises || state.head.data;
        promises = (!util.isArray(promises)) ? [promises] : promises;

        Promise.any(promises)
            .then(function (rr) {
                // console.log("@any resolved ")
                resolve(rr)
            })
    })
};

module.exports = any;