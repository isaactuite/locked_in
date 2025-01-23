
// Function to dynamically load CodeMirror
function loadCodeMirror(callback) {
    const linkCss = document.createElement('link');
    linkCss.rel = 'stylesheet';
    linkCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css';
    document.head.appendChild(linkCss);

    const linkTheme = document.createElement('link');
    linkTheme.rel = 'stylesheet';
    linkTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/monokai.min.css';
    document.head.appendChild(linkTheme);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js';
    script.onload = () => {
        const pythonMode = document.createElement('script');
        pythonMode.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/python/python.min.js';
        pythonMode.onload = callback; // Run the callback once CodeMirror is fully loaded
        document.head.appendChild(pythonMode);
    };
    document.head.appendChild(script);
}

// Function to dynamically load Skulpt
function loadSkulpt(callback) {
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/skulpt/dist/skulpt.min.js';
    script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/skulpt/dist/skulpt-stdlib.js';
        script2.onload = callback; // Run the callback once Skulpt is loaded
        document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
}

// Task definitions
const tasks = [
    { id: 'l1t1', description: 'Run the code to print Hello World', check: 'output', type: 'string', expectedOutput: 'Hello, world!'},
    { id: 'l1t2', description: 'Save value in variable "balls"', check: 'variable', type: 'int', variableName:'balls', expectedValue:42},
];

let currentTaskIndex = 0; // Tracks the current task


// Function to initialize the CodeMirror editor
function initializeEditor(defaultCode) {
    const editor = CodeMirror(document.getElementById('editor'), {
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        tabSize: 4
    });

    // Set editor size to 100% of its container
    editor.setSize("100%", "100%");
    editor.setValue(defaultCode);
    return editor;
}


const lessonsCode = {
    lesson1: 
`# Lesson 1: Introduction to Python
def greet():
    print("Hello, world!")

greet()`,
    
    lesson2: 
`# Lesson 2: Variables and Data Types
def add_numbers(a, b):
    return a + b

print(add_numbers(5, 3))`,

    // Add more lessons here
    lesson3: 
`# Lesson 3: Control Flow
def check_even_odd(num):
    if num % 2 == 0:
        return "Even"
    else:
        return "Odd"

print(check_even_odd(7))`
};


// Example usage: Load lesson 1 when the page is loaded
window.onload = () => {
    loadCodeMirror(() => {
        loadSkulpt(() => {
            console.log('Both CodeMirror and Skulpt have been loaded');
            const thisLessonKey = document.getElementById(`header-container`);

            // Initialize the editor for Lesson 1
            initializeLesson(thisLessonKey);
        });
    });
};








// Utility function to normalize and compare strings
function normalizeAndCompare(userOutput, expectedOutput) {
    const normalize = (str) =>
        str
            .trim() // Remove leading and trailing spaces
            .replace(/\s+/g, ' ') // Collapse multiple spaces into one
            .toLowerCase(); // Convert to lowercase

    return normalize(userOutput) === normalize(expectedOutput);
}

function runCode(editor) {
    const userCode = editor.getValue();
    const outputText = document.getElementById("output-text");
    const task = tasks[currentTaskIndex];
    outputText.textContent = "";

    // Configure Skulpt output
    Sk.configure({
        output: (text) => {
            outputText.textContent += text;
        },
        read: (x) => {
            if (Sk.builtinFiles === undefined || !Sk.builtinFiles["files"][x]) {
                throw `File not found: '${x}'`;
            }
            return Sk.builtinFiles["files"][x];
        },
    });

    // Modified wrapper that preserves code indentation
    const wrappedCode = `import sys
__original_stdout = sys.stdout
__result__ = None
try:
${userCode.split('\n').map(line => '    ' + line).join('\n')}
    __result__ = globals()
except Exception as e:
    __result__ = {"__error__": str(e)}`;

    // Run the code asynchronously
    Sk.misceval
        .asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, wrappedCode))
        .then((module) => {
            const result = Sk.ffi.remapToJs(module.$d.__result__);
            if (result.__error__) {
                outputText.textContent = `Error: ${result.__error__}`;
            } else {
                if (task.check === "output") {
                    const userOutput = outputText.textContent.trim();
                    if (normalizeAndCompare(userOutput, task.expectedOutput)) {
                        outputText.textContent += "\n✅ Correct! Great job!";
                        markTaskComplete(task.id);
                    } else {
                        outputText.textContent += `\n❌ Incorrect. Expected: "${task.expectedOutput}"`;
                    }
                } else if (task.check === "variable") {
                    const variableValue = result[task.variableName];
                    if (String(variableValue) === String(task.expectedValue)) {
                        outputText.textContent += `\n✅ Correct! Variable "${task.variableName}" has the expected value: ${variableValue}`;
                        markTaskComplete(task.id);
                    } else {
                        outputText.textContent += `\n❌ Incorrect value for variable "${task.variableName}". Expected: ${task.expectedValue}, but got: ${variableValue}`;
                    }
                }
            }
        })
        .catch((err) => {
            outputText.textContent = `Error: ${err.toString()}`;
        });
}
// Helper function to mark a task as complete
function markTaskComplete(taskId) {
    const taskCheckbox = document.getElementById(`${taskId}-checkbox`);
    if (taskCheckbox) {
        taskCheckbox.checked = true;

        // Optionally play a sound
        const dingSound = new Audio('C:/Users/isaac/GitHub/locked_in/assets/audio/ding1.mp3');
        dingSound.play();
    }

    // Move to the next task if possible
    currentTaskIndex++;
    if (currentTaskIndex === tasks.length) {
        const outputText = document.getElementById("output-text");
        outputText.textContent += `\n🎉 All tasks completed! Move on to the next lesson.`;
    }
}

let editor;

// Load the libraries and initialize everything
loadCodeMirror(() => {
    loadSkulpt(() => {
        console.log('Both CodeMirror and Skulpt have been loaded');
        
        // Get the lesson ID from the meta tag and initialize the editor
        const lessonId = document.querySelector('meta[name="lesson-id"]').getAttribute('content');

        // Ensure the lesson ID exists in lessonsCode
        if (lessonsCode[lessonId]) {
            const defaultCode = lessonsCode[lessonId]; // Initialize the correct lesson code
            editor = initializeEditor(defaultCode);
        } else {
            console.error(`Lesson ID ${lessonId} not found.`);
        }

        // Initialize Split.js layout for the page
        initializeSplit(editor);

        // Attach the run code functionality to the button
        const runButton = document.getElementById('run-code');
        runButton.addEventListener('click', () => runCode(editor));

        // Add an event listener for the keyboard shortcut (Ctrl + Enter) to run the code
        document.addEventListener("keydown", function (event) {
            if (event.ctrlKey && event.key === "Enter") {
                event.preventDefault(); // Prevent default browser behavior
                runCode(editor); // Call the runCode function
            }
        });
    });
});

