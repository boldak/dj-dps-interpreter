class ScriptError extends Error {
    constructor(message) {
        super();
        this.message = message;
        this.name = "";
    }
}

module.exports = ScriptError;