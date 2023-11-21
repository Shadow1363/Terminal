document.addEventListener('DOMContentLoaded', function () {
    const output = document.getElementById('output');
    const input = document.getElementById('commandInput');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let animationEnabled = true;

    function playKeyboardSound() {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Set the frequency (440 Hz is a common pitch)
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1); // Adjust the duration of the sound
    }

    const body = [{
        aboutme: "Hello I am John Doe...",
        cv: "Prints cv.txt ",
        previouswork: {
            companyX: "I worked for x...",
            companyY: "I worked for y...",
            companyZ: "I worked for y...",
        },
        contact: {
            email: "email@test.com",
            github: "github.com/johndoes",
        }
    }];

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            playKeyboardSound(); // Play the keyboard sound
            processCommand(input.value);
            input.value = '';
        }
    })

    function processCommand(command) {
        const trimmedCommand = command.trim().toLowerCase();
    
        // Check if the command starts with "color"
        if (trimmedCommand.startsWith('color')) {
            // Extract the color value from the command
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
                    loadAndDisplayFile('cv.txt');
                    break;
                case 'previouswork.txt':
                case 'previouswork':
                case 'pre':
                    addToOutput('Previous Work:');
                    for (const company in body[0].previouswork) {
                        if (body[0].previouswork.hasOwnProperty(company)) {
                            addToOutput(`${company}: ${body[0].previouswork[company]}`);
                        }
                    }
                    break;
                case 'contact':
                case 'contact.txt':
                    addToOutput('Contact Information:');
                    for (const method in body[0].contact) {
                        if (body[0].contact.hasOwnProperty(method)) {
                            addToOutput(`${method}: ${body[0].contact[method]}`);
                        }
                    }
                    break;
                case 'help':
                    addToOutput(`ls: List directories
clear: Clear screen
color #hexcode: Change display color
anim: Toggle animation`);
                    break;
                case 'ls':
                    displayBodyContents();
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
                case 'clear':
                case 'cls':
                    clearOutput();
                    break;
                case '':
                    addToOutput(``);
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
            const newLine = document.createElement('div');
            newLine.textContent = text;
            output.appendChild(newLine);
            output.scrollTop = output.scrollHeight;
        }
    }
    
    function animateText(text, output) {
        let currentIndex = 0;
    
        const intervalId = setInterval(() => {
            const currentLine = output.lastChild || document.createElement('div');
            const currentText = (currentLine.textContent || '') + text[currentIndex];
            currentLine.textContent = currentText;
    
            if (!currentLine.parentNode) {
                output.appendChild(currentLine);
            }
    
            if (currentIndex === text.length - 1) {
                output.appendChild(document.createElement('div')); // Add a new line
                clearInterval(intervalId);
                // Scroll to the bottom after the animation is complete
                output.scrollTop = output.scrollHeight;
            }
    
            currentIndex++;
        }, 30); // Adjust the delay between letters (in milliseconds)
    }
    
    function isValidColor(color) {
        const colorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        return colorRegex.test(color);
    }
    
    // Function to change the terminal color
    function changeTerminalColor(newColor) {
        const terminal = document.querySelector('.terminal');
        const elementsToColor = document.querySelectorAll('.prompt, #commandInput, body');
    
        // Apply the color to text, border, and keyframes
        [terminal, ...elementsToColor].forEach(element => {
            element.style.color = newColor;
            if (element === terminal) {
                element.style.borderColor = newColor;
            }
        });
    
        // Change the keyframes dynamically
        const styleSheet = document.styleSheets[0]; // Assuming the styles are in the first stylesheet
        const keyframesRule = findKeyframesRule(styleSheet, 'glow');
    
        if (keyframesRule) {
            keyframesRule.deleteRule(0); // Delete the existing rule
    
            // Add the new rule with the updated color
            keyframesRule.appendRule(`from { text-shadow: 0 0 10px ${newColor}, 0 0 20px ${newColor}, 0 0 30px ${newColor}; }`);
            keyframesRule.appendRule(`to { text-shadow: 0 0 15px ${newColor}, 0 0 25px ${newColor}, 0 0 35px ${newColor}; }`);
        }
    }
    
    // Function to find a specific keyframes rule in a stylesheet
    function findKeyframesRule(styleSheet, ruleName) {
        return Array.from(styleSheet.cssRules).find(rule => rule.type === CSSRule.KEYFRAMES_RULE && rule.name === ruleName) || null;
    }

    function clearOutput() {
        output.innerHTML = '';
    }

    function displayBodyContents() {
        let outputText = '';
        const keys = Object.keys(body[0]);
    
        if (keys.length > 1) {
            keys.forEach((key, index) => {
                outputText += `${key}.txt`;
                if (index < keys.length - 1) {
                    outputText += '  '; // Add space between items
                }})};

        addToOutput(outputText);
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
        if (!event.target.matches('#commandInput')) {
            input.focus();
        }
    });
});
