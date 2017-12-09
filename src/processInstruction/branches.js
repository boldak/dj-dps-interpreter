const ScriptError = require("../scriptError/scriptError")

branches = function(cmdList) {
    // console.log("CREATE BRANCHES: ", cmdList)
    cmdList = cmdList || [];
    let result = [];
    let transaction;
    let c = 0;
    let asyncCount = 0;
    let syncCount = 0;
    try {
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
                // transaction == undefined;
                continue;
            }

            if (c > 0) {
                transaction.settings.childs.push(cmdList[i])
            } else {
                result.push(cmdList[i])
            }

        }
    } catch (e) {
        throw new ScriptError("Async codes structure not recognized")
    }
    if ((asyncCount - syncCount) != 0)
        throw new ScriptError("Some async codes not synchronized")
    return result;
}

module.exports = branches;