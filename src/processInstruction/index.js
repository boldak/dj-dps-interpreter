module.exports = {
    BaseProcessInstruction: require("./baseProcessInstruction"),
    processInstruction: [
        require("./defaults"),
        require("./all"),
        require("./any"),
        require("./async")
    ],
    branches: require("./branches")
};