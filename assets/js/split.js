function loadSplitJs(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/split.js/dist/split.min.js';
    script.onload = callback; // Run the callback once the script is loaded
    document.head.appendChild(script);
}
loadSplitJs(() => {
    // Initialize Split.js after it's loaded
    Split(['#left-pane', '#right-pane'], {
        sizes: [50, 50],
        minSize: 100,
        gutterSize: 10,
        cursor: 'col-resize'
    });
});