function loadSplitJs(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/split.js/dist/split.min.js';
    script.onload = callback; // Run the callback once the script is loaded
    document.head.appendChild(script);
}

loadSplitJs(() => {
    // Initialize Split.js after it's loaded
    Split(['#instruction-pane', '#editor-pane', '#output-pane'], {
        sizes: [33, 34, 33],
        gutterSize: 5,
        minSize: 20,
        onDrag: () => editor.refresh(),
    });
});