const BaseProcessInstruction = require("./baseProcessInstruction");
const Promise = require("bluebird");
const util = require("util");
const copy = require('dj-utils').copy;
const $apply = require('dj-utils').apply;
const branches = require("./branches");
const interpreterUtils = require("../utils/interpreterUtils");

let async = new BaseProcessInstruction("@async");
async.synonims = {};

async["internal aliases"] = {
    "promise": "promise",
    "branch": "promise",
};

async.defaultProperty = {
    "@async": "promise"
};

async.help = {
    synopsis: "Process instruction starts async code between @async and @sync instruction",

    name: {
        "default": "@async",
        synonims: []
    },

    "default param": "promise",
    input: ["string"],
    output: "Promise",

    params: [{
        name: "@async : promise",
        synopsis: "Scope variable path where promise will be stored. Promise not will be stored when scope variable path is undefined.",
        type: ["js-path"],
        synonims: ["promise", "branch"],
        "default value": "undefined"
    }, {
        name: "@sync : vars",
        synopsis: "Array of parent scope variable pathes thats will be synchronized",
        type: ["array of js-path"],
        synonims: [],
        "default value": "none"
    }, {
        name: "@sync : values",
        synopsis: "Array of variable pathes in async code scope  thats store values thats will be synchronized with parent scope",
        type: ["array of js-path"],
        synonims: [],
        "default value": "none"
    }],

    example: {
        description: "Execute async codes",
        code: "@async(promise:'p[0]')\n<?json\n{\"index\":0}\n?>\nset('data')\n@sync(vars:['data[0]'], values:['data'])\n\n@async(promise:'p[1]')\n<?json\n{\"index\":1}\n?>\nset('data')\n@sync(vars:['data[1]'], values:['data'])\n@all({{p}})\nget('data')\n"
    }
};

async.execute = function (command, state, config) {
    // let bb = branchIndex++;
    // console.log("@async "+bb)
    return new Promise(function (resolve, reject) {

        let parent = state.instance;
        let storage = copy(state.storage);
        const Script = require("../script");

        let script = new Script()
            .config(state.instance.config());

        script._state = {
            locale: state.locale,
            instance: script,
            storage: storage,
            promises: {},
            _lib: state._lib,
            head: copy(state.head)
        };


        // state.promises[command.settings.branch] =
        let result =
            new Promise(function (resolve, reject) {
                script
                    .executeBranch(
                        branches(command.settings.childs),
                        script._state
                    )
                    .then(function (_state) {
                        if (command.settings.sync.vars)
                            command.settings.sync.vars.forEach(function (_var, index) {
                                if (util.isString(_var)) {
                                    let value = copy(
                                        interpreterUtils.getProperty(
                                            _state.storage,
                                            command.settings.sync.values[index]
                                        ));
                                    state.storage = $apply(
                                        state.storage, {
                                            path: _var,
                                            value: value
                                        })
                                }
                            });
                        // console.log("@resolve "+bb)
                        resolve(state)
                    })
                    .catch(function (e) {
                        reject(e)
                    })
            });

        // res.storage = storage;

        let _v = command.settings.promise || command.settings.as;

        if (_v) {
            state.storage = $apply(state.storage, {
                path: _v,
                value: result
            })
        }

        state.head = {
            type: "promise",
            data: result
        };
        resolve(state)
    })
};

module.exports = async;