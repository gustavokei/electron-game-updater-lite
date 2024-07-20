import { hot } from "react-hot-loader/root";
import React, { useEffect } from "react";
import "./window-patcher.scss";
import { getConfigFileLocal } from "./utils/getConfigFileLocal.js";
import { showErrorAndPause } from "./utils/showErrorAndPause.js";

const MainWindow = () => {
  const { patcher } = require("./patcher.js");
  const { ipcRenderer } = require("electron");
  const configFileLocal = getConfigFileLocal();

  useEffect(() => {
    ipcRenderer.on("call-patcher", () => {
      document.getElementById("btnClose").addEventListener("click", () => {
        ipcRenderer.send("close-app");
      });
      if (!configFileLocal) {
        showErrorAndPause("update.json not found");
      } else {
        patcher(configFileLocal);
      }
    });
  }, [configFileLocal]);

  return (
    <div className="App">
      <div className="top-bar">
        <div className="draggable"></div>
        <button id="btnClose">X</button>
      </div>
      <div id="totalProgress">
        <div id="totalMid">
          <div id="totalBar" />
        </div>
      </div>
      <span id="txtStatus" className="text">
        Starting launcher...
      </span>
      <span id="txtProgress" className="text" />
      <span id="txtDownloadSpeed" className="text" />
      <span id="txtTimeRemaining" className="text" />
      <button id="btnStart" className="btnStart">
        Play
      </button>
      <button id="btnStartDisabled" className="btnStart">
        Play
      </button>
    </div>
  );
};

export default hot(MainWindow);
