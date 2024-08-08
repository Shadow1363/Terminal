document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("./files/config.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const json = await response.json();
    bootScreen(json.version);
    fetchBody(json);
  } catch (error) {
    console.error("Error fetching config:", error.message || error);
  }
});
