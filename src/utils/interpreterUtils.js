const util = require("util");
const jp = require("jsonpath");

class InterpreterUtils{
    constructor(){}

    getProperty(d, path) {
        try{
            let result = undefined;
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
            });
            return result
        } catch (e){
            return undefined;
        }
    }

    applyContext(o, c) {
        if (util.isObject(o)) {
            for (let key in o) {
                o[key] = this.applyContext(o[key], c)
            }
            return o
        }
        if (util.isArray(o)) {
            return o.map(function(item) {
                return this.applyContext(item, c)
            })
        }
        if (util.isString(o)) {
            if (o.match(/^\{\{[\s\S]*\}\}$/)) {
                let key = o.substring(2, o.length - 2);
                let r = this.getProperty(c, key);
                return (r) ? r : null
            } else {
                return o
            }
        }
        return o;
    };
}

module.exports = new InterpreterUtils();