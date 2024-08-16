```
   ___           __  ___     ___        ______              _           __
  / _ \___  ____/ /_/ _/__  / (_)__    /_  __/__ ______ _  (_)__  ___ _/ /
 / ___/ _ \/ __/ __/ _/ _ \/ / / _ \    / / / -_) __/  ' \/ / _ \/ _ `/ /
/_/   \___/_/  \__/_/ \___/_/_/\___/   /_/  \__/_/ /_/_/_/_/_//_/\_,_/_/

Portfolio Terminal [Version 1.02]
(c) Open Source. https://github.com/Shadow1363/terminal
A simple Linux Terminal Themed - Portfolio Website
```

# how it works

```json
{
  "version": 1.02,
  "config": {
    "help": [
      "echo: Echos your message",
      "ls: List directories",
      "cls: Clear screen",
      "color #hexcode: Change display color",
      "anim: Toggle text animation",
      "fx: Toggle sound effects",
      "cd: Go to /",
      "font #font: Change display font"
    ],
    "anim": true,
    "sound": true,
    "color": "#00ff00",
    "fonts": [
      { "name": "Monospace", "alias": ["1", "monospace", "m", "default"] },
      {
        "name": "\"Courier New\", monospace",
        "alias": ["2", "courier new", "c"]
      },
      {
        "name": "\"JetBrains Mono NL\", sans-serif",
        "alias": ["3", "jetbrains", "j"]
      }
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

The whole program is dependant on `files/config.json`. Edit it to your heart's content.
You can also add .txt files in `/files` and it will open up when acessed.
You can configure the color used, should animations/sound play and add/change fonts.

# planned features

- ~~cleaner, more optimized code & ease of editing or modifying~~ **DONE**
- OS boot screen (similar to pico-8, lethal company, etc) **Halfway Done**
- Icon
- bug fixes
  1. Animation breaks if another command is sent while it's animating text
  2. Sound Improvements
  3. Tab Autocomplete (@n3dhir already had added this but due to the rework, I have to add it again)
  4. Limit text/Infinitly long background
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
