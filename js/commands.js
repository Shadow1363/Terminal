async function fetchBody(json) {
  const root = document.querySelector(":root");
  const input = document.getElementById("terminal");
  const output = document.getElementById("output");
  input.focus();

  const fonts = json.config.fonts;
  const help = json.config.help.join("\n");
  let animationEnabled = json.config.anim;
  let soundEnabled = json.config.sound;
  let search = json.website;

  const color = json.config.color;
  const changeTerminalColor = (newColor) => {
    root.style.setProperty("--color", newColor);
  };
  changeTerminalColor(color);

  let previousInputs = [""];
  let numberInputs = 0;

  const handleArrowKeys = () => {
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        if (e.key === "ArrowUp" && numberInputs > 0) {
          numberInputs -= 1;
        } else if (
          e.key === "ArrowDown" &&
          numberInputs < previousInputs.length - 1
        ) {
          numberInputs += 1;
        }
        input.value = previousInputs[numberInputs] || "";
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  };

  const handleClickOutside = (event) => {
    if (!event.target.matches("#terminal")) {
      input.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (soundEnabled) playKeyboardSound();

      if (input.value) {
        previousInputs = [
          ...previousInputs.slice(0, numberInputs + 1),
          input.value,
        ];
        numberInputs = previousInputs.length - 1;
        processCommand(input.value);
        input.value = previousInputs[numberInputs];
        input.value = "";
      }
    }
  };

  const processCommand = (command) => {
    const trimmedCommand = command.trim().toLowerCase();
    const commandHandlers = {
      font: (params) => changeTerminalFont(params),
      color: (params) => colorCommands(params),
      help: () => addToOutput(help),
      anim: () => {
        animationEnabled = !animationEnabled;
        addToOutput(
          animationEnabled ? "Text is animated." : "Text is no longer animated."
        );
      },
      fx: () => {
        soundEnabled = !soundEnabled;
        addToOutput(
          soundEnabled ? "Sound effects unmuted." : "Sound effects muted."
        );
      },
      cls: () => clearOutput(),
      hello: () => addToOutput(`${input.value} world!`),
      cd: (params) => {
        if (params === "") {
          search = json.website;
          document.getElementById("prompt").textContent = `/`;
        }
        const path = params.split(" ").filter(Boolean);
        let currentSearch = search;

        for (let i = 0; i < path.length; i++) {
          const key = path[i];
          if (currentSearch.hasOwnProperty(key)) {
            currentSearch = currentSearch[key];
            if (typeof currentSearch === "object") {
              document.getElementById("prompt").textContent = `/${key}`;
              addToOutput(`/${key}`);
            } else {
              addToOutput(currentSearch);
              return;
            }
          } else {
            addToOutput(`Directory not found: ${key}`);
            return;
          }
        }

        search = currentSearch;
      },
      ls: () => addToOutput(Object.keys(search).join("  ")),
    };

    const commandKeys = Object.keys(commandHandlers);

    const matchingCommand = commandKeys.find((key) =>
      trimmedCommand.startsWith(key)
    );

    if (matchingCommand) {
      const params = trimmedCommand.slice(matchingCommand.length).trim();
      commandHandlers[matchingCommand](params);
    } else if (search.hasOwnProperty(trimmedCommand)) {
      const value = search[trimmedCommand];
      if (typeof value === "object") {
        search = value;
        document.getElementById("prompt").textContent = `/${trimmedCommand}`;
        addToOutput(`/${trimmedCommand}`);
      } else if (typeof value === "string" && value.includes(".txt")) {
        loadAndDisplayFile(trimmedCommand);
      } else {
        addToOutput(value);
      }
    } else {
      addToOutput("Command not found: " + trimmedCommand);
    }
  };

  const addToOutput = (text) => {
    const outputElement = document.createElement("pre");
    outputElement.textContent = text || " ";
    if (animationEnabled) {
      animateText(text, output);
    } else {
      output.appendChild(outputElement);
      output.scrollTop = output.scrollHeight;
    }
  };

  const animateText = (text, output) => {
    let currentIndex = 0;
    const currentLine = document.createElement("pre");
    output.appendChild(currentLine);

    const intervalId = setInterval(() => {
      currentLine.textContent += text[currentIndex];
      if (currentIndex === text.length - 1) {
        output.appendChild(document.createElement("pre"));
        clearInterval(intervalId);
        output.scrollTop = output.scrollHeight;
      }
      currentIndex++;
    }, 1);
  };

  const clearOutput = () => {
    output.innerHTML = "";
  };

  const colorCommands = (string) => {
    const color = string.toLowerCase();
    if (color === "random" || color === "rand" || color === "ran") {
      changeTerminalColor(
        `#${Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")}`
      );
    } else if (color === "reset" || color === "default" || color === "lime") {
      changeTerminalColor(color);
      addToOutput(`Color was reset.`);
    } else if (isValidColor(string)) {
      changeTerminalColor(string);
      addToOutput(`Color changed to: ${string}`);
    } else {
      addToOutput("Invalid color input. Please enter a valid hex code.");
    }
  };

  const isValidColor = (color) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);

  const changeTerminalFont = (string) => {
    const type = string.toLowerCase();
    const font = fonts.find((font) =>
      font.alias.some((alias) => type.includes(alias))
    );

    if (font) {
      root.style.setProperty("--font", font.name);
      addToOutput(`Font changed to ${font.name}.`);
    } else {
      addToOutput("Invalid font selected.");
    }
  };

  const loadAndDisplayFile = (filename) => {
    const tryLoadFile = async (file) => {
      const response = await fetch(`files/${file}`);
      return await (response.ok
        ? response.text()
        : Promise.reject(`Error loading file: ${file}`));
    };

    tryLoadFile(filename)
      .then((content) => addToOutput(content))
      .catch(() => {
        tryLoadFile(`${filename}.txt`)
          .then((content) => addToOutput(content))
          .catch((error) => addToOutput(`Error loading file: ${error}`));
      });
  };

  document.addEventListener("click", handleClickOutside);
  input.addEventListener("keydown", handleKeyDown);
  handleArrowKeys();
}

function playKeyboardSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}
