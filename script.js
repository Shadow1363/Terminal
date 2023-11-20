document.addEventListener('DOMContentLoaded', function () {
    const output = document.getElementById('output');
    const input = document.getElementById('commandInput');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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
        switch (command.trim()) {
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
                addToOutput(`ls: List directories\nclear: Clear screen`);
                break;
            case 'ls':
                displayBodyContents();
                break;
            case 'clear':
            case 'cls':
                clearOutput();
                break;
            case '':
                addToOutput(``);
                break;
            default:
                addToOutput('Command not found: ' + command);
        }
    }

    function addToOutput(text) {
        // Split the text into lines
        const lines = text.split('\n');
    
        // Calculate the maximum width of the terminal
        const maxWidth = output.clientWidth;
    
        // Process each line
        lines.forEach(line => {
            // Split the line into chunks that fit within the terminal width
            const chunks = chunkText(line, maxWidth);
    
            // Append each chunk as a new line
            chunks.forEach(chunk => {
                const newLine = document.createElement('div');
                newLine.textContent = chunk;
                output.appendChild(newLine);
            });
        });
    
        // Ensure the output is scrolled to the bottom
        output.scrollTop = output.scrollHeight;
    }
    
    // Function to chunk text into lines that fit within a specified width
    function chunkText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
    
        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = getTextWidth(testLine);
    
            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        });
    
        lines.push(currentLine);
        return lines;
    }
    
    // Function to get the width of a text element in pixels
    function getTextWidth(text) {
        const testElement = document.createElement('div');
        testElement.style.position = 'absolute';
        testElement.style.whiteSpace = 'nowrap';
        testElement.textContent = text;
        document.body.appendChild(testElement);
        const width = testElement.clientWidth;
        document.body.removeChild(testElement);
        return width;
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