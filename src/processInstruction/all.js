const BaseProcessInstruction = require("./baseProcessInstruction");
const Promise = require("bluebird");
const util = require("util");

let all = new BaseProcessInstruction("@all");
all.synonims = {};

all["internal aliases"] = {
    "promises": "promises",
    "branches": "promises",
};
all.defaultProperty = {
    "@all": "promises"
};
all.help = {
    synopsis: "Process instruction waits ALL selected async codes",

    name: {
        "default": "@all",
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

all.execute = function (command, state, config) {
    // console.log("@all")
    return new Promise(function (resolve, reject) {
        let promises = command.settings.promises || state.head.data;
        promises = (!util.isArray(promises)) ? [promises] : promises;

        Promise.all(promises)
            .then(function (st) {
                // console.log("@all resolved ")
                resolve(st[0])
            })
            .catch(function (e) {
                // console.log("Promise.all rejected ", e)
                reject(e)
            })
    })
};

module.exports = all;