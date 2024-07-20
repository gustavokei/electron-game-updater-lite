const showErrorAndPause = (error) => {
    document
    .getElementById("btnStartDisabled")
    .style.setProperty("display", "block");
    document.getElementById("txtStatus").innerHTML = error;
    alert(error);
}

module.exports = { showErrorAndPause };
