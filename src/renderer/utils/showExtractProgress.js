const showExtractProgress = (progress) => {
    // Extract progress percentage
    const fileProgress = Math.floor(progress.percent);

    // Display progress
    document.getElementById("txtProgress").innerHTML = `${fileProgress}%`;
    document.getElementById("totalBar").style.setProperty("width", fileProgress + "%");

    // Update time remaining
    document.getElementById("txtDownloadSpeed").innerHTML = '';
    document.getElementById("txtTimeRemaining").innerHTML = '';
}

module.exports = { showExtractProgress };
