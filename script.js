document.addEventListener('DOMContentLoaded', function () {
    const output = document.getElementById('output');
    const input = document.getElementById('terminal');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let animationEnabled = true;
    let soundEnabled = true;
    let currentDir = "/";
    let previousInputs =[];
    let numberInputs = "";
    
    function playKeyboardSound() {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Set the frequency (440 Hz is a common pitch)
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1); // Adjust the duration of the sound
    }

    const body = [{
        "aboutme.txt": "Hello I am John Doe...",
        "cv.txt": "cv.txt",
        "/previouswork": {
            "companyX.txt": "I worked for x...",
            "companyY.txt": "I worked for y...",
            "companyZ.txt": "I worked for y...",
        },
        "/contact": {
            "email.txt": "email@test.com",
            "github.txt": "github.com/johndoes",
        },
        "/blog": {
            "21-11-2023": "21-11-2023.txt",
        }
    }];

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (soundEnabled == true){playKeyboardSound()}; // Play the keyboard sound
            previousInputs.push(input.value)
            previousInputs = previousInputs.filter(item => item !== "")
            previousInputs.push("");
            numberInputs = previousInputs.length - 1;
            console.log(previousInputs)
            processCommand(input.value);
            input.value = '';
        }
    })

    function processCommand(command) {
        const trimmedCommand = command.trim().toLowerCase();
    
        // Check if the command starts with "color"
        if (trimmedCommand.startsWith('color')) {
            // Extract the color value from the command
            if(trimmedCommand === "color random" || trimmedCommand === "color ran"){
                const color = generateRandomHexColor()
                changeTerminalColor(color);
                addToOutput(`Color changed to: ${color}`);
            } else {
            const colorValue = trimmedCommand.split(' ')[1];
    
            if(colorValue === "reset"){
                changeTerminalColor("#00ff00");
                addToOutput(`Color was reset.`);
            }
            else if (isValidColor(colorValue)) {
                changeTerminalColor(colorValue);
                addToOutput(`Color changed to: ${colorValue}`);
            } else {
                addToOutput('Invalid color input. Please enter a valid hex code.');
            }
        }
        } else {
            // Handle other commands...
            switch (trimmedCommand) {
                case 'about':
                case 'aboutme':
                case 'aboutme.txt':
                    addToOutput(body[0].aboutme);
                    break;
                case 'cv':
                case 'cv.txt':
                    clearOutput();
                    loadAndDisplayFile(body[0]["cv.txt"]);
                    break;
                case '/previouswork':
                case 'pre':
                    currentDir = "/previouswork"
                    document.getElementById('prompt').textContent = currentDir;
                    break;
                case 'contact':
                case '/contact':
                    currentDir = "/contact"
                    document.getElementById('prompt').textContent = currentDir;
                    break;
                case 'blog':
                case '/blog':
                    currentDir = "/blog"
                    document.getElementById('prompt').textContent = currentDir;
                    break;
                case 'help':
                    addToOutput(`ls: List directories
clear: Clear screen
color #hexcode: Change display color
anim: Toggle text animation
fx: Toggle sound effects
cd: Go to /`);
                    break;
                case 'ls':
                    if (currentDir == "/"){
                        displayBodyContents(body[0]);
                    } else if (body[0].hasOwnProperty(currentDir)){
                        displayBodyContents(body[0][currentDir]);
                    } else {
                        addToOutput("Directory not found.")
                    }
                    break;
                case 'anim':
                case 'animation':
                    if (animationEnabled){
                        animationEnabled = false
                        addToOutput("Text is no longer animated.")
                    } else {
                        animationEnabled = true
                        addToOutput("Text is animated.")
                    };
                    break;
                case 'sound':
                case 'fx':
                    if (soundEnabled){
                        soundEnabled = false
                        addToOutput("Sound effects muted.")
                    } else {
                        soundEnabled = true
                        addToOutput("Sound effects unmuted.")
                    };
                    break;
                case 'clear':
                case 'cls':
                    clearOutput();
                    break;
                case 'cd':
                    currentDir = "/"
                    document.getElementById('prompt').textContent = currentDir;
                    break;
                case 'hello':
                case 'Hello':
                    addToOutput(`${input.value} world!`)
                    break;
                case '':
                    break;
                default:
                    addToOutput('Command not found: ' + trimmedCommand);
            }
        }
    }

    function addToOutput(text) {
        const output = document.getElementById('output');
    
        if (animationEnabled) {
            animateText(text, output);
        } else {
            const newLine = document.createElement('pre');
            newLine.textContent = text;
            output.appendChild(newLine);
            output.scrollTop = output.scrollHeight;
        }
    }
    
    function animateText(text, output) {
        let currentIndex = 0;
        output.appendChild(document.createElement('pre'));
    
        const intervalId = setInterval(() => {
            const currentLine = output.lastChild || document.createElement('pre');
            const currentText = (currentLine.textContent || '') + text[currentIndex];
            currentLine.textContent = currentText;
    
            if (!currentLine.parentNode) {
                output.appendChild(currentLine);
            }
    
            if (currentIndex === text.length - 1) {
                output.appendChild(document.createElement('pre')); // Add a new line
                clearInterval(intervalId);
                // Scroll to the bottom after the animation is complete
                output.scrollTop = output.scrollHeight;
            }
    
            currentIndex++;
        },1); // Adjust the delay between letters (in milliseconds)
    }
    
    function isValidColor(color) {
        const colorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        return colorRegex.test(color);
    }
    
    // Function to change the terminal color
    function changeTerminalColor(newColor) {
        document.querySelector(':root').style.setProperty('--lime', newColor)
    };

    function clearOutput() {
        output.innerHTML = '';
    }
    
    function displayBodyContents(technicalDir) {
        let outputText = '';
    
        for (const key in technicalDir) {
                    outputText += `${key} `;
            }

        addToOutput(outputText);
    }

    function generateRandomHexColor() {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    
        return '#' + '0'.repeat(6 - randomColor.length) + randomColor;
    }

    function loadAndDisplayFile(filename) {
        fetch(filename)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error loading file: ${filename}`);
                }
                return response.text();
            })
            .then(content => {
                addToOutput(content);
            })
            .catch(error => {
                addToOutput(error.message);
            });
    }

    // Set focus on the command input when the page loads
    input.focus();

    // Prevent clicking away from the input
    document.addEventListener('click', function (event) {
        if (!event.target.matches('#terminal')) {
            input.focus();
        }
    });


    document.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'ArrowUp':
                if (numberInputs > 0) {
                 console.log(previousInputs[numberInputs])
                 document.getElementById('terminal').value = previousInputs[numberInputs-1]
                 numberInputs-=1
                 console.log(numberInputs)
                }
                break;
            case 'ArrowDown':
                if (previousInputs[numberInputs] != undefined) {
                console.log(previousInputs[numberInputs])
                 document.getElementById('terminal').value = previousInputs[numberInputs]
                 numberInputs+=1
                 console.log(numberInputs)
                }
                break;
        }
    });


});