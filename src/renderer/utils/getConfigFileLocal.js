const { ipcRenderer } = require("electron");
const fs = require("fs");
const filePath = ipcRenderer.sendSync("get-file-path", "");
const isDevelopment = process.env.NODE_ENV !== 'production';

const getConfigFileLocal = () => {
    let configFileLocal
    try {
        if (isDevelopment) {
            configFileLocal = JSON.parse(fs.readFileSync("update.json"))
        } else {
            configFileLocal = JSON.parse(fs.readFileSync(filePath + "/update.json"));
        }
        return configFileLocal;
    } catch (error) {
        return null;
    }
}

module.exports = { getConfigFileLocal };
