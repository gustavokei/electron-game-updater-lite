const { app, ipcMain } = require("electron");
const createMainWindow = require("./mainWindow");
const isDevelopment = process.env.NODE_ENV !== "production";
const path = require("path");

let mainWindow;

app.on("ready", () => {
  mainWindow = createMainWindow();

  ipcMain.on("close-app", () => {
    app.exit();
  });

  ipcMain.on("get-file-path", (event) => {
    if (isDevelopment) {
      event.returnValue = path.dirname(app.getAppPath());
    } else {
      event.returnValue = process.env.PORTABLE_EXECUTABLE_DIR;
    }
  });

  const { download } = require("electron-dl");
  ipcMain.on("download", (event, data) => {
    data.options.onProgress = (status) => {
      mainWindow.send("download progress", status);
    };
    download(mainWindow, data.url, data.options)
      .then(() => {
        switch (data.options.step) {
          case "launcher":
            mainWindow.send("download launcher complete");
            break;
          case "client":
            mainWindow.send("download client complete");
            break;
          case "patch":
            mainWindow.send("download patch complete");
            break;
          default:
            mainWindow.send("download default complete");
        }
      })
      .catch(() => {
        mainWindow.send("download error");
      });
  });
});
