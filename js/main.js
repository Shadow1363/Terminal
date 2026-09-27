document.addEventListener("DOMContentLoaded", async function () {
  const output = document.getElementById("output");
  const inputLine = document.querySelector(".input-line");
  inputLine.style.visibility = "hidden";

  try {
    const response = await fetch("./files/config.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const json = await response.json();
    document.documentElement.style.setProperty("--color", json.config.color);
    await bootScreen(output, json);
    inputLine.style.visibility = "";
    createTerminal(json);
  } catch (error) {
    console.error("Error fetching config:", error.message || error);
    const pre = document.createElement("pre");
    pre.textContent = `Failed to load files/config.json: ${error.message || error}`;
    output.appendChild(pre);
  }
});
