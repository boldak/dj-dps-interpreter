

var Promise = require("bluebird");
var parser = require("dj-dps-parser");
var jp = require("jsonpath");
var copy = require('dj-utils').copy;
var $apply = require('dj-utils').apply;
var $plain = require('dj-utils').plain;
// var logger = require("../log").global;
var util = require("util");
// var setVar = require("./impl/var/set").implementation;

var ScriptError = function(message) {
    this.message = message;
    this.name = "";
}
ScriptError.prototype = Object.create(Error.prototype);
ScriptError.prototype.constructor = ScriptError;

var branchIndex = 0
var processInctruction = {
    
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
                var promises = command.settings.promises || state.head.data;
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
                var promises = command.settings.promises || state.head.data;
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
                var getProperty = function(d, path) {
                        var result = undefined;
                        jp.apply(d, path, function(value) {
                            if (util.isUndefined(result)) {
                                result = value;
                            } else {
                                if (!util.isArray(result)) {
                                    result = [result]
                                }
                                result.push(value)
                            }
                            return value
                        })
                        return result
                    }
                var bb = branchIndex++;    
                // console.log("@async "+bb)
                return new Promise(function(resolve, reject) {

                    var parent = state.instance;
                    var storage = copy(state.storage);

                    var s = new Script()
                        .config(state.instance.config())

                    s._state = {
                        locale: state.locale,
                        client: state.client,
                        instance: s,
                        storage: storage,
                        promises:{},
                        _lib: state._lib,
                        head: copy(state.head)
                    }

                    
                    // state.promises[command.settings.branch] = 
                    var result = 
                    new Promise(function(resolve,reject){
                        s
                        .executeBranch(
                            processInctruction.branches(command.settings.childs), 
                            s._state
                        )
                        .then(function(_state){
                            if(command.settings.sync.vars)
                                command.settings.sync.vars.forEach(function(_var,index){
                                    if(util.isString(_var)){
                                     var value = copy(
                                        getProperty(
                                            _state.storage,
                                             command.settings.sync.values[index]
                                    ))   
                                     state.storage = $apply(
                                                        state.storage, {
                                                            path: _var, 
                                                            value: value 
                                                        })
                                    }
                                })
                            // console.log("@resolve "+bb)
                            resolve(state)
                        })
                        .catch(function(e){
                            reject(e)
                        })
                    })
                    
                    // res.storage = storage;
                    
                    var _v = command.settings.promise || command.settings.as;
                    
                    if(_v){
                        state.storage = $apply(state.storage, {
                                                path: _v, 
                                                value: result 
                                            })
                    }

                    state.head = {
                        type:"promise",
                        data: result  
                    }
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
        var result = [];
        var transaction;
        var c = 0;
        var asyncCount = 0;
        var syncCount = 0;
        try{
            for (var i = 0; i < cmdList.length; i++) {
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
                    result.push(transaction)
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
} 





var Script = function(config, script, context) {

    this._script = script;
    this.id = branchIndex++;
    this._config = [
        processInctruction["@async"],
        processInctruction["@all"],
        processInctruction["@any"],
        processInctruction["@defaults"]
    ]
    
    config = config || [];
    this._config = this._config.concat(config)

    this._state = {
        locale: "en",
        instance: this,
        promises: {},
        storage: context || {},
        head: {
            type: undefined,
            data: undefined
        }
    }
    // console.log("Create Script instance "+this.id)
    return this;
}


Script.prototype.errorState = function(msg) {
    this._state.head = {
        type: "error",
        data: msg.toString()
    }
    delete this._state.instance;
    return this._state;
}

Script.prototype.host = function(host) {
    if(host){
        this._host = host;
        return this;
    }
    return this._host
}

Script.prototype.execute = function(command, state, config) {

    var getProperty = function(d, path) {
        try{
        var result = undefined;
        jp.apply(d, path, function(value) {
            if (util.isUndefined(result)) {
                result = value;
            } else {
                if (!util.isArray(result)) {
                    result = [result]
                }
                result.push(value)
            }
            return value
        })
        return result
    } catch (e){
        return undefined
    }
    }

    var applyContext = function(o, c) {
        if (util.isObject(o)) {
            for (var key in o) {
                o[key] = applyContext(o[key], c)
            }
            return o
        }
        if (util.isArray(o)) {
            return o.map(function(item) {
                return applyContext(item, c)
            })
        }
        if (util.isString(o)) {
            if (o.match(/^\{\{[\s\S]*\}\}$/)) {
                var key = o.substring(2, o.length - 2);
                var r = getProperty(c, key);
                // return (r) ? copy(r) : null
                return (r) ? r : null
            } else {
                return o
            }
        }
        return o;
    }

    var self = this;

    return new Promise(function(resolve, reject) {
        let executor;
        // console.log("state: ", state)
        if(state.packages){
            state.packages.forEach((pkg) => {
                // console.log("test ", pkg+"."+command.processId)
                let executor_index = self._config.map(item => item.name).indexOf(pkg+"."+command.processId);
                // console.log("index: ", executor_index)
                if(executor && executor_index >= 0){
                    reject(new ScriptError("Dublicate command implementation: '" + command.processId ))
                }
                executor = (executor_index >=0)
                            ? self._config[executor_index]
                            : executor                
            })
        }    
    
        
        executor = (!executor)
                    ? self._config[self._config.map(item => item.name).indexOf(command.processId)]
                    : executor
        
        // console.log("!founded ", executor);

        // if(command.processId.indexOf("@") == 0)
        //     executor = processInctruction[command.processId];

        if (!executor || !executor.execute) {
            reject(new ScriptError("Command '" + command.processId + "'  not implemented"))
            return
        }

        try {
           
            // console.log("PREPARE: ", command)
            if(command.processId != "@async")
                command = applyContext(command, self._state.storage)
            // console.log("EXEC: ", command)
            
            var s = executor.execute(command, self._state, config)
            if (s.then) {
                s
                    .then(function(state) {
                        resolve(state)
                    })
                    .catch(function(e) {
                        reject(e)
                    })

            } else {
                resolve(s)
            }
        } catch (e) { 
            reject(e) 
        }
    })
}

Script.prototype.executeBranch = function(commandList, state){
    // console.log("BRANCH: ", commandList)
    var self = this;
    if (state) {
            self._state.locale = state.locale || self._state.locale;
            self._state.client = state.client || self._state.client;
            
            self._state.storage = state.storage || self._state.storage;
        }
    return Promise
            .reduce(commandList, function(cp, command, index) {
                return new Promise(function(resolve, reject) {
                    if(self._state.head.type == "error")
                    reject(new ScriptError(self._state.head.data.message))    
                    setTimeout(function(){
                        self.execute(command, self._state, self._config)
                            .then(function(newState) {
                                self._state = newState
                                resolve(self._state)
                            })
                            .catch(function(e) {
                                let lineIndex = parser.ErrorMapper().findLineOfCommandStart(self._script, index)+1;
                                let text = parser.ErrorMapper().findTextOfCommand(self._script, index);
                                reject(new ScriptError(
                                        `
Detect error at line ${lineIndex}:
...
${text}
^
${e.toString()}
`
                                ))        
                                        
                            })
                    }, 0)    
                })
            }, 0)
}

Script.prototype.getResult = function(o){
    var pathes = $plain(o).map(function(item){
        return {
            path: item.path,
            value: (item.value instanceof Promise) ? item.value.toString() : item.value
        }
    })
    return (util.isArray(o)) ? $apply([], pathes) : $apply({}, pathes)
}

Script.prototype.run = function(state) {
    // console.log("Run with state", state)
    var self = this;
    return new Promise(function(resolve, reject) {
        if (!self._script) {
            reject(new ScriptError("Cannot run undefined script"))
        }
        if (self._config.length == 0) {
           reject(new ScriptError("Interpretator not configured"))
        }

        try {
            var commandList = new parser()
                .config(self._config)
                .parse(self._script);
        } catch (e) {
            reject(new ScriptError(e.toString()))
        }
        // console.log("Parsed script: ",commandList)
        commandList = processInctruction.branches(commandList, state)

        self.executeBranch(commandList, state)
            .then(function() {
                if(self._state.head.data instanceof Promise){
                    resolve({
                        type:"promise",
                        data:self._state.head.data.toString()
                    })
                }
                resolve(self.getResult(self._state.head))
            })
            .catch(function(e) {
                reject(new ScriptError("On "+self._host+": "+e.toString()))
            })
    })

}

Script.prototype.script = function() {
    if (arguments.length > 0) {
        this._script = arguments[0];
        return this;
    }
    return this._script;
}

Script.prototype.state = function() {
    if (arguments.length > 0) {
        this._state = arguments[0];
        return this;
    }
    return this._state;
}

Script.prototype.config = function() {
    if (arguments.length > 0) {
        this._config = this._config.concat(arguments[0]);
        return this;
    }
    return this._config;
}

module.exports = Script;












