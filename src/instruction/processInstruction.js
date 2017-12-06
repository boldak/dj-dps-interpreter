var processInstruction = {

    "@defaults":{
        name: "@defaults",

        synonims: {
            "@def" : "@defaults",
            "@use" : "@defaults"
        },

        "internal aliases": {
            "packages": "packages"
        },

        defaultProperty: {
            "@defaults" : "packages",
            "@def" : "packages",
            "@use" : "packages"
        },

        help: {
            synopsis: "Process instruction set usage of defaults packages ",

            name: {
                "default": "@defaults",
                synonims: []
            },

            "default param": "promise",

            input:["string"],

            output:"Promise",

            params: [{
                name: "promises",
                synopsis: "Array of async code promises thats must be resolved",
                type:["array of promises", "bindable"],
                synonims: ["promises", "branches"],
                "default value": "undefined"
            }],

            example: {
                description: "Execute async codes",
                code:  "@async(promise:'p[0]')\n<?json\n{\"index\":0}\n?>\nset('data')\n@sync(vars:['data[0]'], values:['data'])\n\n@async(promise:'p[1]')\n<?json\n{\"index\":1}\n?>\nset('data')\n@sync(vars:['data[1]'], values:['data'])\n@all({{p}})\nget('data')\n"
            }
        },

        execute: function(command, state, config) {
            // console.log("@defaults", command)
            return new Promise(function(resolve,reject){


                state.packages = (command.settings.packages)
                    ? !util.isArray(command.settings.packages)
                        ? [command.settings.packages]
                        : command.settings.packages
                    : undefined;


                resolve(state)
            })
        }
    },

    "@all": {
        name: "@all",
        synonims: {},
        "internal aliases": {
            "promises": "promises",
            "branches": "promises",
        },

        defaultProperty: {
            "@all" : "promises"
        },
        help: {
            synopsis: "Process instruction waits ALL selected async codes",

            name: {
                "default": "@all",
                synonims: []
            },

            "default param": "promise",
            input:["string"],
            output:"Promise",

            params: [{
                name: "promises",
                synopsis: "Array of async code promises thats must be resolved",
                type:["array of promises", "bindable"],
                synonims: ["promises", "branches"],
                "default value": "undefined"
            }],

            example: {
                description: "Execute async codes",
                code:  "@async(promise:'p[0]')\n<?json\n{\"index\":0}\n?>\nset('data')\n@sync(vars:['data[0]'], values:['data'])\n\n@async(promise:'p[1]')\n<?json\n{\"index\":1}\n?>\nset('data')\n@sync(vars:['data[1]'], values:['data'])\n@all({{p}})\nget('data')\n"
            }
        },

        execute: function(command, state, config) {
            // console.log("@all")
            return new Promise(function(resolve,reject){
                let promises = command.settings.promises || state.head.data;
                promises = (!util.isArray(promises)) ? [promises] : promises;

                Promise.all(promises)
                    .then(function(st){
                        // console.log("@all resolved ")
                        resolve(st[0])
                    })
                    .catch(function(e){
                        // console.log("Promise.all rejected ", e)
                        reject(e)
                    })
            })
        }
    },

    "@any": {
        name: "@any",
        synonims: {},
        "internal aliases": {
            "promises": "promises",
            "branches": "promises",
        },

        defaultProperty: {
            "@any" : "promises"
        },
        help: {
            synopsis: "Process instruction waits ANY selected async codes",

            name: {
                "default": "@any",
                synonims: []
            },

            "default param": "promise",
            input:["string"],
            output:"Promise",

            params: [{
                name: "promises",
                synopsis: "Array of async code promises thats must be resolved",
                type:["array of promises", "bindable"],
                synonims: ["promises", "branches"],
                "default value": "undefined"
            }],

            example: {
                description: "Execute async codes",
                code:  "@async(promise:'p[0]')\n<?json\n{\"index\":0}\n?>\nset('data')\n@sync(vars:['data[0]'], values:['data'])\n\n@async(promise:'p[1]')\n<?json\n{\"index\":1}\n?>\nset('data')\n@sync(vars:['data[1]'], values:['data'])\n@all({{p}})\nget('data')\n"
            }
        },

        execute: function(command, state, config) {
            // console.log("@any")
            return new Promise(function(resolve,reject){
                let promises = command.settings.promises || state.head.data;
                promises = (!util.isArray(promises)) ? [promises] : promises;

                Promise.any(promises)
                    .then(function(rr){
                        // console.log("@any resolved ")
                        resolve(rr)
                    })
            })
        }
    },

    "@async": {
        name: "@async",
        synonims: {},
        "internal aliases": {
            "promise": "promise",
            "branch": "promise",
        },

        defaultProperty: {
            "@async" : "promise"
        },
        help: {
            synopsis: "Process instruction starts async code between @async and @sync instruction",

            name: {
                "default": "@async",
                synonims: []
            },

            "default param": "promise",
            input:["string"],
            output:"Promise",

            params: [{
                name: "@async : promise",
                synopsis: "Scope variable path where promise will be stored. Promise not will be stored when scope variable path is undefined.",
                type:["js-path"],
                synonims: ["promise", "branch"],
                "default value": "undefined"
            },{
                name: "@sync : vars",
                synopsis: "Array of parent scope variable pathes thats will be synchronized",
                type:["array of js-path"],
                synonims: [],
                "default value": "none"
            },{
                name: "@sync : values",
                synopsis: "Array of variable pathes in async code scope  thats store values thats will be synchronized with parent scope",
                type:["array of js-path"],
                synonims: [],
                "default value": "none"
            }],

            example: {
                description: "Execute async codes",
                code:  "@async(promise:'p[0]')\n<?json\n{\"index\":0}\n?>\nset('data')\n@sync(vars:['data[0]'], values:['data'])\n\n@async(promise:'p[1]')\n<?json\n{\"index\":1}\n?>\nset('data')\n@sync(vars:['data[1]'], values:['data'])\n@all({{p}})\nget('data')\n"
            }
        },

        execute: function(command, state, config) {
            // let bb = branchIndex++;
            // console.log("@async "+bb)
            return new Promise(function(resolve, reject) {

                let parent = state.instance;
                let storage = copy(state.storage);

                let script = new Script()
                    .config(state.instance.config());

                script._state = {
                    locale: state.locale,
                    instance: script,
                    storage: storage,
                    promises:{},
                    _lib: state._lib,
                    head: copy(state.head)
                };


                // state.promises[command.settings.branch] =
                let result =
                    new Promise(function(resolve,reject){
                        script
                            .executeBranch(
                                processInstruction.branches(command.settings.childs),
                                script._state
                            )
                            .then(function(_state){
                                if(command.settings.sync.vars)
                                    command.settings.sync.vars.forEach(function(_var,index){
                                        if(util.isString(_var)){
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
                            .catch(function(e){
                                reject(e)
                            })
                    });

                // res.storage = storage;

                let _v = command.settings.promise || command.settings.as;

                if(_v){
                    state.storage = $apply(state.storage, {
                        path: _v,
                        value: result
                    })
                }

                state.head = {
                    type:"promise",
                    data: result
                };
                resolve(state)
            })
                .catch(function(e){
                    reject(e)
                })
        }
    },

    branches: function(cmdList) {
        // console.log("CREATE BRANCHES: ", cmdList)
        cmdList = cmdList || [];
        let result = [];
        let transaction;
        let c = 0;
        let asyncCount = 0;
        let syncCount = 0;
        try{
            for (let i = 0; i < cmdList.length; i++) {
                if (["@async"].indexOf(cmdList[i].processId) >= 0) asyncCount++;
                if (["@sync"].indexOf(cmdList[i].processId) >= 0) syncCount++;

                if (["@async"].indexOf(cmdList[i].processId) >= 0 && c == 0) {
                    // console.log("@async settings ", cmdList[i].settings)
                    transaction = cmdList[i];
                    transaction.settings.childs = [];
                    c++;
                    continue;
                }

                if (["@async"].indexOf(cmdList[i].processId) >= 0 && c > 0) {
                    c++
                }

                if (["@sync"].indexOf(cmdList[i].processId) >= 0 && c > 0) {
                    c--
                }

                if (["@sync"].indexOf(cmdList[i].processId) >= 0 && c == 0) {
                    transaction.settings.sync = cmdList[i].settings;
                    result.push(transaction);
                    transaction == undefined;
                    continue;
                }

                if (c > 0) {
                    transaction.settings.childs.push(cmdList[i])
                } else {
                    result.push(cmdList[i])
                }

            }
        } catch(e){
            throw new ScriptError("Async codes structure not recognized")
        }
        if( (asyncCount-syncCount) != 0)
            throw new ScriptError("Some async codes not synchronized")
        return result;
    }
} ;

module.exports = processInstruction;