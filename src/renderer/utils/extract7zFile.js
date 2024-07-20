const Seven = require("node-7z");
const path = require("path");
const fs = require("fs");
const sevenBin = require("7zip-bin");
const isDevelopment = process.env.NODE_ENV !== "production";

const get7zaPath = () => {
  if (isDevelopment) {
    return sevenBin.path7za;
  } else {
    if (
      fs.existsSync(
        path.join(
          process.resourcesPath,
          "node_modules",
          "7zip-bin",
          "win",
          "x64",
          "7za.exe"
        )
      )
    ) {
      return path.join(
        process.resourcesPath,
        "node_modules",
        "7zip-bin",
        "win",
        "x64",
        "7za.exe"
      );
    } else {
      return path.join(
        __dirname,
        "..",
        "node_modules",
        "7zip-bin",
        "win",
        "x64",
        "7za.exe"
      );
    }
  }
};

const extract7zFile = async (archivePath, outputDir, progressCallback) => {
  // eslint-disable-next-line no-undef
  return new Promise((resolve, reject) => {
    const pathTo7zip = get7zaPath();
    const extractionStream = Seven.extractFull(archivePath, outputDir, {
      $bin: pathTo7zip,
      $progress: true,
    });

    extractionStream.on("progress", (progress) => {
      progressCallback(progress);
    });

    extractionStream.on("end", () => {
      resolve();
    });

    extractionStream.on("error", (err) => {
      console.error(err);
      reject(err);
    });
  });
};

module.exports = { extract7zFile };
