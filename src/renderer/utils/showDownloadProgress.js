const showDownloadProgress = (status, startTime) => {
    // Update the progress bar
    const fileProgress = Math.floor(status.percent * 100);
    const transferredMB = (status.transferredBytes / (1024 * 1024)).toFixed(2); // MB
    const totalMB = (status.totalBytes / (1024 * 1024)).toFixed(2); // MB

    document.getElementById("txtProgress").innerHTML = `${fileProgress}% (${transferredMB}MB/${totalMB}MB)`;
    document.getElementById("totalBar").style.setProperty("width", fileProgress + "%");

    // Calculate download speed in MB per second
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    
    // Avoid division by zero
    const downloadSpeed = elapsedSeconds > 0
        ? (status.transferredBytes / (1024 * 1024)) / elapsedSeconds // MB per second
        : 0;
    
    // Estimate time remaining in seconds
    const remainingBytes = status.totalBytes - status.transferredBytes;
    const timeRemaining = downloadSpeed > 0
        ? remainingBytes / (downloadSpeed * 1024 * 1024) // in seconds
        : 0;
    
    const timeRemainingStr = new Date(timeRemaining * 1000).toISOString().substr(11, 8); // Convert to HH:MM:SS

    // Update download speed and time remaining
    document.getElementById("txtDownloadSpeed").innerHTML = `Download speed: ${downloadSpeed.toFixed(2)} MB/s`;
    document.getElementById("txtTimeRemaining").innerHTML = `Time remaining: ${timeRemainingStr}`;
}

module.exports = { showDownloadProgress };
