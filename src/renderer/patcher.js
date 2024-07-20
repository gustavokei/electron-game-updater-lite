const { ipcRenderer } = require("electron");
const { showErrorAndPause } = require("./utils/showErrorAndPause");
const { getConfigFileRemote } = require("./utils/getConfigFileRemote");
const { addCacheBustingSuffix } = require("./utils/addCacheBustingSuffix");
const { showText } = require("./utils/showText");
const { updateJson } = require("./utils/updateJson");
const { getFileNameFromUrl } = require("./utils/getFileNameFromUrl");
const { extract7zFile } = require("./utils/extract7zFile");
const { showDownloadProgress } = require("./utils/showDownloadProgress");
const { showExtractProgress } = require("./utils/showExtractProgress");
const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  patcher: async (configLocal) => {
    let startTime;
    const fs = require("fs");
    const currentDir = ipcRenderer.sendSync("get-file-path", "");
    const configLocalPath = isDevelopment
      ? "update.json"
      : `${currentDir}\\update.json`;
    const configRemote = await getConfigFileRemote(
      configLocal?.updaterUrl
    ).then((res) => res[2]);
    const clientDir = configRemote?.clientDir;
    const launcherNewPath = `${currentDir}\\launcher-new.exe`;
    const replaceScriptPath = `${currentDir}\\launcher-update.bat`;

    const updateLauncher = async () => {
      if (configRemote?.launcherVer > configLocal?.launcherVer) {
        showText("Downloading new launcher");

        if (fs.existsSync(launcherNewPath)) {
          fs.unlinkSync(launcherNewPath);
        }

        startTime = Date.now();
        ipcRenderer.send("download", {
          url: addCacheBustingSuffix(configRemote?.launcherUrl),
          options: {
            directory: currentDir,
            filename: "launcher-new.exe",
            step: "launcher",
          },
        });

        ipcRenderer.on("download launcher complete", () => {
          updateJson("launcherVer", configRemote.launcherVer, configLocalPath);
          replaceExecutable();
        });

        ipcRenderer.on("download error", () => {
          showErrorAndPause("Ocorreu um erro ao baixar o launcher");
        });
      } else {
        await updateClient();
      }
    };

    const replaceExecutable = () => {
      const replaceScriptContent = `
      @echo off
      set MAX_RETRIES=3
      set RETRY_COUNT=0

      :RETRY
      move /Y "${currentDir}\\launcher-new.exe" "${currentDir}\\${getFileNameFromUrl(
        configRemote?.launcherUrl
      )}"
      if errorlevel 1 (
          set /A RETRY_COUNT+=1
          if %RETRY_COUNT% lss %MAX_RETRIES% (
              timeout /t 1 /nobreak >nul
              goto RETRY
          ) else (
              echo Maximum retries reached. Exiting.
              exit /b 1
          )
      )
      start "" "${currentDir}\\${getFileNameFromUrl(configRemote?.launcherUrl)}"
      del /F "${replaceScriptPath}"
      `;

      if (fs.existsSync(replaceScriptPath)) {
        fs.unlinkSync(replaceScriptPath);
      }
      fs.writeFileSync(replaceScriptPath, replaceScriptContent, "utf8");

      const { spawn } = require("child_process");
      spawn(`start /min cmd.exe /C ${replaceScriptPath}`, {
        detached: true,
        shell: true,
      });
      ipcRenderer.send("close-app");
    };

    const updateClient = async () => {
      if (configRemote?.clientVer > configLocal?.clientVer) {
        showText("Downloading client");

        if (!fs.existsSync(currentDir + `\\${clientDir}\\`)) {
          fs.mkdirSync(currentDir + `\\${clientDir}\\`);
        }

        const clientZipPath = `${currentDir}\\${clientDir}\\${getFileNameFromUrl(
          configRemote.clientUrl
        )}`;

        if (fs.existsSync(clientZipPath)) {
          fs.unlinkSync(clientZipPath);
        }

        startTime = Date.now();
        ipcRenderer.send("download", {
          url: addCacheBustingSuffix(configRemote?.clientUrl),
          options: {
            directory: `${currentDir}\\${clientDir}`,
            filename: getFileNameFromUrl(configRemote?.clientUrl),
            step: "client",
          },
        });

        ipcRenderer.on("download client complete", async () => {
          showText("Extracting client");
          await extract7zFile(
            clientZipPath,
            `${currentDir}\\${clientDir}`,
            (progress) => {
              showExtractProgress(progress);
            }
          )
            .then(async () => {
              if (fs.existsSync(clientZipPath)) {
                fs.unlinkSync(clientZipPath);
              }
              updateJson("clientVer", configRemote.clientVer, configLocalPath);
              await updatePatch();
            })
            .catch((e) => {
              console.error(e);
              showErrorAndPause(`Something went wrong while extracting a file`);
            });
        });
      } else {
        await updatePatch();
      }
    };

    const updatePatch = async () => {
      const patchZipPath = `${currentDir}\\${clientDir}\\${getFileNameFromUrl(
        configRemote.patchUrl
      )}`;

      if (configRemote?.patchVer > configLocal?.patchVer) {
        showText("Downloading update patch");

        if (fs.existsSync(patchZipPath)) {
          fs.unlinkSync(patchZipPath);
        }

        startTime = Date.now();
        ipcRenderer.send("download", {
          url: addCacheBustingSuffix(configRemote?.patchUrl),
          options: {
            directory: `${currentDir}\\${clientDir}`,
            filename: getFileNameFromUrl(configRemote?.patchUrl),
            step: "patch",
          },
        });

        ipcRenderer.on("download patch complete", async () => {
          showText("Extracting update patch");
          await extract7zFile(
            patchZipPath,
            `${currentDir}\\${clientDir}`,
            (progress) => {
              showExtractProgress(progress);
            }
          )
            .then(() => {
              if (fs.existsSync(patchZipPath)) {
                fs.unlinkSync(patchZipPath);
              }
              updateJson("patchVer", configRemote.patchVer, configLocalPath);
              finish();
            })
            .catch(() => {
              showErrorAndPause(`Something went wrong while extracting a file`);
            });
        });
      } else {
        finish();
      }
    };

    const finish = () => {
      showText("Update completed");
      document.getElementById("totalBar").style.setProperty("width", "100%");
      document.getElementById("txtProgress").innerHTML = "";
      document
        .getElementById("btnStartDisabled")
        .style.setProperty("display", "none");
      document.getElementById("btnStart").addEventListener("click", () => {
        const { spawn } = require("child_process");
        spawn(configRemote.startCmd, {
          cwd: currentDir + `\\${clientDir}\\`,
          detached: true,
          shell: true,
        });
        ipcRenderer.send("close-app");
      });
    };

    ipcRenderer.on("download progress", (event, status) => {
      showDownloadProgress(status, startTime);
    });

    ipcRenderer.on("download error", () => {
      showErrorAndPause(`Error while downloading a file`);
    });

    try {
      await updateLauncher();
    } catch (e) {
      showErrorAndPause(e);
    }
  },
};
