const BOOT_STEPS = [
  ["Checking video adapter", 150],
  ["Detecting keyboard", 120],
  ["Mounting /files", 200],
  ["Loading config.json", 180],
  ["Starting terminal", 250],
];

async function bootScreen(output, { version, config }) {
  let skipped =
    !config.anim || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skip = () => (skipped = true);
  window.addEventListener("keydown", skip);
  window.addEventListener("pointerdown", skip);

  const sleep = (ms) =>
    skipped ? Promise.resolve() : new Promise((r) => setTimeout(r, ms));
  const line = (text) => {
    const pre = document.createElement("pre");
    pre.className = "boot";
    pre.textContent = text;
    output.appendChild(pre);
    return pre;
  };

  if (!skipped) {
    line(`PORTFOLIO BIOS v${version}          (press any key to skip)`);
    line(" ");
    const memory = line("Memory test: 0K");
    for (let kb = 64; kb <= 640; kb += 64) {
      await sleep(25);
      memory.textContent = `Memory test: ${kb}K`;
    }
    memory.textContent += " OK";
    for (const [label, ms] of BOOT_STEPS) {
      const pre = line(`${label}...`);
      await sleep(ms);
      pre.textContent += " OK";
    }
    await sleep(400);
    output.replaceChildren();
  }

  window.removeEventListener("keydown", skip);
  window.removeEventListener("pointerdown", skip);

  const logo = document.createElement("pre");
  logo.className = "raw";
  logo.textContent = `
   ___           __  ___     ___        ______              _           __
  / _ \\___  ____/ /_/ _/__  / (_)__    /_  __/__ ______ _  (_)__  ___ _/ /
 / ___/ _ \\/ __/ __/ _/ _ \\/ / / _ \\    / / / -_) __/  ' \\/ / _ \\/ _ \`/ /
/_/   \\___/_/  \\__/_/ \\___/_/_/\\___/   /_/  \\__/_/ /_/_/_/_/_//_/\\_,_/_/

Portfolio Terminal [Version ${version}]
(c) Open Source. https://github.com/Shadow1363/terminal

Type help to get started (Tab to autocomplete, ↑/↓ for history):`;
  output.appendChild(logo);
}
