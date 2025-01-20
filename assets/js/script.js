
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

// Function to initialize the CodeMirror editor
function initializeEditor() {
    const editor = CodeMirror(document.getElementById('editor'), {
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        tabSize: 4
    });

    // Set editor size to 100% of its container
    editor.setSize("100%", "100%");
    return editor;
}

// Function to run Python code using Skulpt
function runCode(editor) {
    const code = editor.getValue();
    const outputText = document.getElementById("output-text");
    outputText.textContent = ""; // Clear previous output

    // Configure Skulpt to capture output
    Sk.configure({
        output: (text) => {
            outputText.textContent += text; // Append output to the output pane
        },
        read: (x) => {
            if (Sk.builtinFiles === undefined || !Sk.builtinFiles["files"][x]) {
                throw `File not found: '${x}'`;
            }
            return Sk.builtinFiles["files"][x];
        },
    });

    // Run the code asynchronously and check the output
    Sk.misceval
        .asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code))
        .then(() => {
            const userOutput = outputText.textContent.trim();
            const expectedOutput = "Hello, world!"; // Expected output for this lesson
            if (userOutput === expectedOutput) {
                outputText.textContent += "\n✅ Correct! Great job!";
            } else {
                outputText.textContent += `\n❌ Incorrect. Expected: "${expectedOutput}"`;
            }
        })
        .catch((err) => {
            outputText.textContent = `Error: ${err.toString()}`;
        });
}

// Function to initialize the Split.js layout
function initializeSplit(editor) {
    Split(['#instruction-pane', '#editor-pane', '#output-pane'], {
        sizes: [33, 34, 33],
        gutterSize: 5,
        minSize: 20,
        onDrag: () => editor.refresh(),
    });
}

// Load the libraries and initialize everything
loadCodeMirror(() => {
    loadSkulpt(() => {
        console.log('Both CodeMirror and Skulpt have been loaded');
        
        // Initialize the editor and set up the code execution
        const editor = initializeEditor();

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
