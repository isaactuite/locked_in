// Function to dynamically load Split.js
function loadSplitJs(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/split.js/dist/split.min.js';
    script.onload = callback; // Run the callback once the script is loaded
    document.head.appendChild(script);
}

// Initialize Split.js after the script is loaded
loadSplitJs(() => {
    console.log("Split.js loaded successfully");
    splitOutputPane(); // Call to initialize the split after Split.js loads
});

// Function to initialize the Split.js layout
function initializeSplit(editor) {
    Split(['#instruction-pane', '#editor-pane', '#output-pane'], {
        sizes: [33, 34, 33],
        gutterSize: 5,
        minSize: 20,
        onDrag: () => editor.refresh(),
    });
    Split(['#output-div', '#chat-window'], {
            direction: 'vertical', // This creates a **horizontal split** (top-bottom)
            sizes: [40, 60], // Adjust the size distribution (50% each)
            gutterSize: 5,
            minSize: 200, // Minimum size for each section
        });
}

