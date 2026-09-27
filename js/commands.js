function createTerminal(json) {
  const root = document.documentElement;
  const terminal = document.querySelector(".terminal");
  const output = document.getElementById("output");
  const input = document.getElementById("terminal");
  const promptEl = document.getElementById("prompt");

  const { config, website } = json;
  const maxEntries = config.scrollback ?? 200;
  let animationEnabled = config.anim;
  let soundEnabled = config.sound;

  // ---------- sound ----------
  let audioContext;
  const beep = (frequency = 440, duration = 0.08) => {
    if (!soundEnabled) return;
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    // Short fade-out avoids the "click" of cutting the wave off abruptly
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  };
  const errorBeep = () => beep(160, 0.15);

  // ---------- output ----------
  // Everything printed goes through one queue so animations never overlap.
  const queue = [];
  let flushing = false;
  let generation = 0; // bumped by cls to cancel queued/running output

  const scrollToBottom = () => {
    terminal.scrollTop = terminal.scrollHeight;
  };

  // content may be a string or a Promise<string> (e.g. a file being fetched)
  const print = (content, className) => {
    queue.push({ content, className });
    if (!flushing) flush();
  };

  const flush = async () => {
    flushing = true;
    while (queue.length) {
      const gen = generation;
      const { content, className } = queue.shift();
      const text = String((await content) ?? "");
      if (gen !== generation) continue;

      const line = document.createElement("pre");
      if (className) line.className = className;
      output.appendChild(line);
      while (output.childElementCount > maxEntries) {
        output.firstElementChild.remove();
      }

      if (animationEnabled && text && className !== "cmd") {
        await typeInto(line, text, gen);
      } else {
        line.textContent = text || " ";
      }
      scrollToBottom();
    }
    flushing = false;
  };

  const typeInto = (line, text, gen) =>
    new Promise((resolve) => {
      const node = line.appendChild(document.createTextNode(""));
      // At least 4 chars per frame, and never longer than ~45 frames
      const step = Math.max(4, Math.ceil(text.length / 45));
      let i = 0;
      const tick = () => {
        if (gen !== generation) return resolve();
        node.appendData(text.slice(i, (i += step)));
        scrollToBottom();
        if (i < text.length) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });

  // ---------- filesystem ----------
  let path = [];
  const dirAt = (p) => p.reduce((dir, key) => dir[key], website);
  const cwd = () => dirAt(path);
  const isDir = (value) => typeof value === "object" && value !== null;
  const findKey = (dir, name) =>
    Object.keys(dir).find((key) => key.toLowerCase() === name.toLowerCase());

  const setPath = (p) => {
    path = p;
    promptEl.textContent = `/${path.join("/")}`;
  };

  // Accepts "a b", "a/b", "/a", "..", etc.
  const resolve = (target) => {
    const p = target.trim().startsWith("/") ? [] : [...path];
    for (const segment of target.split(/[\s/]+/).filter(Boolean)) {
      if (segment === "..") {
        p.pop();
        continue;
      }
      if (segment === ".") continue;
      const dir = dirAt(p);
      const key = findKey(dir, segment);
      if (key === undefined) return { missing: segment };
      if (!isDir(dir[key])) return { path: p, leaf: dir[key] };
      p.push(key);
    }
    return { path: p };
  };

  const fileCache = new Map();
  const loadFile = (name) => {
    if (!fileCache.has(name)) {
      const request = fetch(`files/${encodeURI(name)}`)
        .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
        .catch(() => {
          fileCache.delete(name);
          errorBeep();
          return `Error loading file: ${name}`;
        });
      fileCache.set(name, request);
    }
    return fileCache.get(name);
  };

  const open = (value) => {
    if (typeof value === "string" && /\.txt$/i.test(value)) {
      print(loadFile(value), "raw");
    } else {
      print(value);
    }
  };

  const cd = (target) => {
    if (!target.trim()) return setPath([]);
    const result = resolve(target);
    if (result.missing) {
      errorBeep();
      return print(`Directory not found: ${result.missing}`);
    }
    if ("leaf" in result) return open(result.leaf);
    setPath(result.path);
    print(promptEl.textContent);
  };

  // ---------- commands ----------
  const setColor = (color) => root.style.setProperty("--color", color);

  const commands = {
    help: () => print(config.help.join("\n")),
    echo: (args) => print(args),
    ls: () => print(Object.keys(cwd()).join("  ")),
    cd,
    cls: () => {
      generation++;
      queue.length = 0;
      output.replaceChildren();
    },
    color: (args) => {
      const color = args.toLowerCase();
      if (["random", "rand", "ran"].includes(color)) {
        const hex = `#${Math.floor(Math.random() * 0x1000000)
          .toString(16)
          .padStart(6, "0")}`;
        setColor(hex);
        print(`Color changed to: ${hex}`);
      } else if (["reset", "default"].includes(color)) {
        setColor(config.color);
        print("Color was reset.");
      } else if (color && CSS.supports("color", color)) {
        setColor(color);
        print(`Color changed to: ${color}`);
      } else {
        errorBeep();
        print("Invalid color input. Please enter a valid hex code.");
      }
    },
    font: (args) => {
      const name = args.toLowerCase();
      const font = config.fonts.find(
        (f) => f.alias.includes(name) || f.name.toLowerCase() === name
      );
      if (font) {
        root.style.setProperty("--font", font.name);
        print(`Font changed to ${font.name}.`);
      } else {
        errorBeep();
        print(
          "Invalid font selected. Available fonts:\n" +
            config.fonts.map((f) => `  ${f.alias.join(", ")}: ${f.name}`).join("\n")
        );
      }
    },
    anim: () => {
      animationEnabled = !animationEnabled;
      print(animationEnabled ? "Text is animated." : "Text is no longer animated.");
    },
    fx: () => {
      soundEnabled = !soundEnabled;
      print(soundEnabled ? "Sound effects unmuted." : "Sound effects muted.");
    },
  };

  const run = (raw) => {
    const trimmed = raw.trim();
    print(`${promptEl.textContent} ${trimmed}`, "cmd");
    if (!trimmed) return;

    const [, name, args] = trimmed.match(/^(\S+)\s*(.*)$/);
    const command = name.toLowerCase();
    if (Object.hasOwn(commands, command)) {
      commands[command](args);
    } else if (!resolve(trimmed).missing) {
      cd(trimmed); // typing a directory/file name directly opens it
    } else {
      errorBeep();
      print(`Command not found: ${name}`);
    }
  };

  // ---------- tab autocomplete ----------
  const commonPrefix = (words) =>
    words.reduce((a, b) => {
      let i = 0;
      while (i < a.length && a[i].toLowerCase() === b[i]?.toLowerCase()) i++;
      return a.slice(0, i);
    });

  const pathCandidates = (target) => {
    const result = resolve(target);
    if (result.missing || "leaf" in result) return [];
    const dir = dirAt(result.path);
    return Object.keys(dir).map((key) => [key, isDir(dir[key]) ? "/" : " "]);
  };

  const complete = () => {
    const value = input.value;
    const words = value.trimStart().split(/\s+/);
    const partial = words.pop();
    const slash = partial.lastIndexOf("/");
    const stem = partial.slice(slash + 1);
    const first = words[0]?.toLowerCase();

    let candidates;
    if (!words.length && slash === -1) {
      candidates = [
        ...Object.keys(commands).map((c) => [c, " "]),
        ...pathCandidates(""),
      ];
    } else if (first === "cd" || !Object.hasOwn(commands, first ?? "")) {
      const base = [...words.slice(first === "cd" ? 1 : 0), partial.slice(0, slash + 1)];
      candidates = pathCandidates(base.join(" "));
    } else if (first === "font" && words.length === 1) {
      candidates = config.fonts.flatMap((f) => f.alias.map((a) => [a, " "]));
    } else if (first === "color" && words.length === 1) {
      candidates = [["random", " "], ["reset", " "]];
    } else {
      candidates = [];
    }

    const matches = candidates.filter(([c]) =>
      c.toLowerCase().startsWith(stem.toLowerCase())
    );
    const head = value.slice(0, value.length - stem.length);
    if (!matches.length) return errorBeep();
    if (matches.length === 1) {
      input.value = head + matches[0][0] + matches[0][1];
      return;
    }
    const prefix = commonPrefix(matches.map(([c]) => c));
    if (prefix.length > stem.length) {
      input.value = head + prefix;
    } else {
      print(`${promptEl.textContent} ${value}`, "cmd");
      print([...new Set(matches.map(([c]) => c))].join("  "));
    }
  };

  // ---------- input ----------
  const history = [];
  let historyIndex = 0;

  input.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "Enter": {
        e.preventDefault();
        beep();
        const raw = input.value;
        input.value = "";
        if (raw.trim() && history.at(-1) !== raw) history.push(raw);
        historyIndex = history.length;
        run(raw);
        break;
      }
      case "ArrowUp":
      case "ArrowDown":
        e.preventDefault();
        historyIndex += e.key === "ArrowUp" ? -1 : 1;
        historyIndex = Math.max(0, Math.min(historyIndex, history.length));
        input.value = history[historyIndex] ?? "";
        input.setSelectionRange(input.value.length, input.value.length);
        break;
      case "Tab":
        e.preventDefault();
        complete();
        break;
    }
  });

  // Refocus the input on click, unless the user is selecting text to copy
  document.addEventListener("click", (e) => {
    if (e.target !== input && !window.getSelection().toString()) input.focus();
  });

  input.focus();
}
