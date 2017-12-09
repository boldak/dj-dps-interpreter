const Promise = require("bluebird");
const parser = require("dj-dps-parser");
const $apply = require('dj-utils').apply;
const $plain = require('dj-utils').plain;
const util = require("util");
const interpreterUtils = require("./utils/interpreterUtils");
const ScriptError = require("./scriptError/scriptError");
const processInstruction = require("./processInstruction/index");
// var logger = require("../log").global;
// var setVar = require("./impl/var/set").implementation;

let branchIndex = 0;

class Script {
    constructor(config, script, context) {

        this._script = script;
        this.id = branchIndex++;
        this._config = processInstruction.processInstruction;

        config = config || [];
        this._config = this._config.concat(config);

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
    }

    errorState(msg) {
        this._state.head = {
            type: "error",
            data: msg.toString()
        };
        delete this._state.instance;
        return this._state;
    }

    host(host) {
        if (host) {
            this._host = host;
            return this;
        }
        return this._host
    }

    execute(command, state, config) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let executor;
            // console.log("state: ", state)
            if (state.packages) {
                state.packages.forEach((pkg) => {
                    // console.log("test ", pkg+"."+command.processId)
                    let executor_index = self._config.map(item => item.name).indexOf(pkg + "." + command.processId);
                    // console.log("index: ", executor_index)
                    if (executor && executor_index >= 0) {
                        reject(new ScriptError("Duplicate command implementation: '" + command.processId))
                    }
                    executor = (executor_index >= 0)
                        ? self._config[executor_index]
                        : executor
                })
            }


            executor = (!executor)
                ? self._config[self._config.map(item => item.name).indexOf(command.processId)]
                : executor;

            if (!executor || !executor.execute) {
                reject(new ScriptError(`Command '${command.processId}'  not implemented`));
                return
            }

            // console.log("PREPARE: ", command)
            if (command.processId !== "@async")
                command = interpreterUtils.applyContext(command, self._state.storage);
            // console.log("EXEC: ", command)

            let s = executor.execute(command, self._state, config);
            if (s instanceof Promise) {
                s
                    .then(function (state) {
                        resolve(state)
                    })
                    .catch(function (e) {
                        reject(e)
                    })

            } else {
                resolve(s)
            }
        });

    }

    executeBranch(commandList, state) {
        // console.log("BRANCH: ", commandList)
        if (state) {
            this._state.locale = state.locale || this._state.locale;
            this._state.storage = state.storage || this._state.storage;
        }
        let self = this;
        return Promise
            .reduce(commandList, function (cp, command, index) {
                return new Promise(function (resolve, reject) {
                    if (self._state.head.type === "error")
                        reject(new ScriptError(self._state.head.data.message));
                    setTimeout(function () {
                        self.execute(command, self._state, self._config)
                            .then(function (newState) {
                                self._state = newState;
                                resolve(self._state)
                            })
                            .catch(function (e) {
                                reject(new ScriptError(`Script ${self.id} command [${index}] '${command.processId}': ${e.toString()}`))
                            })
                    }, 0)
                })
            }, 0)
    }

    getResult(o) {
        let pathes = $plain(o).map(function (item) {
            return {
                path: item.path,
                value: (item.value instanceof Promise) ? item.value.toString() : item.value
            }
        });
        return (util.isArray(o)) ? $apply([], pathes) : $apply({}, pathes)
    }

    run(state) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (!self._script) {
                reject(new ScriptError("Cannot run undefined script"))
            }
            if (self._config.length === 0) {
                reject(new ScriptError("Interpreter not configured"))
            }
            let commandList;
            try {
                commandList = new parser()
                    .config(self._config)
                    .parse(self._script);
            } catch (e) {
                reject(new ScriptError(e.toString()))
            }
            // console.log("Parsed script: ",commandList)
            commandList = processInstruction.branches(commandList, state);

            self.executeBranch(commandList, state)
                .then(function () {
                    if (self._state.head.data instanceof Promise) {
                        resolve({
                            type: "promise",
                            data: self._state.head.data.toString()
                        })
                    }
                    resolve(self.getResult(self._state.head))
                })
                .catch(function (e) {
                    reject(new ScriptError(`On ${self._host}: ${e.toString()}`));
                })
        })
    }

    script() {
        if (arguments.length > 0) {
            this._script = arguments[0];
            return this;
        }
        return this._script;
    }

    state() {
        if (arguments.length > 0) {
            this._state = arguments[0];
            return this;
        }
        return this._state;
    }

    config() {
        if (arguments.length > 0) {
            this._config = this._config.concat(arguments[0]);
            return this;
        }
        return this._config;
    }
}

module.exports = Script;