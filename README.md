```
   ___           __  ___     ___        ______              _           __
  / _ \___  ____/ /_/ _/__  / (_)__    /_  __/__ ______ _  (_)__  ___ _/ /
 / ___/ _ \/ __/ __/ _/ _ \/ / / _ \    / / / -_) __/  ' \/ / _ \/ _ `/ /
/_/   \___/_/  \__/_/ \___/_/_/\___/   /_/  \__/_/ /_/_/_/_/_//_/\_,_/_/

Portfolio Terminal [Version 1.03]
(c) Open Source. https://github.com/Shadow1363/terminal
A simple Linux Terminal Themed - Portfolio Website
```

# how it works

```json
{
  "version": "1.03",
  "config": {
    "help": [
      "echo <text>: Echos your message",
      "ls: List directories",
      "cd <dir>: Change directory (cd .. to go up, cd to go to /)",
      "cls: Clear screen",
      "color <#hex|name|random|reset>: Change display color",
      "font <font>: Change display font",
      "anim: Toggle text animation",
      "fx: Toggle sound effects",
      "",
      "Tab: Autocomplete | Up/Down: Command history"
    ],
    "anim": true,
    "sound": true,
    "color": "#00ff00",
    "scrollback": 200,
    "fonts": [
      { "name": "Monospace", "alias": ["1", "monospace", "m", "default"] },
      { "name": "\"Courier New\", monospace", "alias": ["2", "courier new", "courier", "c"] },
      { "name": "\"JetBrains Mono NL\", monospace", "alias": ["3", "jetbrains mono", "jetbrains", "j"] }
    ]
  },
  "website": {
    "about_me": {
      "resume": "Hello I am John Doe...",
      "picture": "picture.txt"
    },
    "cv": "cv.txt",
    "previous_work": {
      "company_x": "I worked for x...",
      "company_y": "I worked for y...",
      "company_z": "I worked for y..."
    },
    "contact": {
      "email": "john.doe@gmail.com",
      "github": "github.com/johndoe"
    }
  }
}
```

The whole program is dependent on `files/config.json`. Edit it to your heart's content.
You can also add .txt files in `/files` and they will open up when accessed.
You can configure the color used, whether animations & sound play, how many outputs are kept on screen (`scrollback`) and add fonts.

Anything in `website` becomes the file system: objects are directories, strings are files (a string ending in `.txt` is loaded from `/files`).
Navigate with `cd about_me`, `cd about_me/resume`, `cd ..`, or just type a name directly. Tab autocompletes commands and paths, Up/Down browses history.

# planned features

- ~~cleaner, more optimized code & ease of editing or modifying~~ **DONE**
- ~~OS boot screen (similar to pico-8, lethal company, etc)~~ **DONE** (press any key to skip, disabled when `anim` is false)
- ~~Icon~~ **DONE** (`favicon.svg`)
- bug fixes
  1. ~~Animation breaks if another command is sent while it's animating text~~ **DONE** (output is queued)
  2. ~~Sound Improvements~~ **DONE** (single audio context, click-free beeps, error tone)
  3. ~~Tab Autocomplete~~ **DONE** (commands, paths, fonts & colors)
  4. ~~Limit text/Infinitly long background~~ **DONE** (long lines wrap, scrollback is capped, background stays fixed)
  5. ~~Arrow Keys not bring history back properly~~ thanks @n3dhir!

# /cover

You can ignore it, it's going to be used for my personal site, tomasmartinez.xyz

# resources

https://manytools.org/hacker-tools/ascii-banner/
I recommend small/small-slanted

https://www.asciiart.eu/image-to-ascii
I recommend "Transparent frame 10px"

# license

[![Hippocratic License HL3-FULL](https://img.shields.io/static/v1?label=Hippocratic%20License&message=HL3-FULL&labelColor=5e2751&color=bc8c3d)](https://firstdonoharm.dev/version/3/0/full.html)
