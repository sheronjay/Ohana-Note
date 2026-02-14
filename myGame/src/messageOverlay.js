/**
 * Creates a scrollable message overlay on top of the letter sprite
 * @param {string} message - The message text to display

 * @param {Function} onClose - Optional callback function to call when close button is clicked
 * @returns {HTMLElement} The overlay element
 */
export function createMessageOverlay(message, onClose) {
    // Create scrollable message overlay
    const messageOverlay = document.createElement("div");
    messageOverlay.style.position = "absolute";
    messageOverlay.style.top = "50%";
    messageOverlay.style.left = "50%";
    messageOverlay.style.transform = "translate(-50%, -50%)";
    messageOverlay.style.width = "500px";
    messageOverlay.style.height = "350px";
    messageOverlay.style.zIndex = "1000";
    messageOverlay.style.pointerEvents = "none";

    // Create the text container (scrollable area)
    const textContainer = document.createElement("div");
    textContainer.style.width = "100%";
    textContainer.style.height = "100%";
    textContainer.style.overflowY = "auto";
    textContainer.style.padding = "80px 60px 60px 60px";
    textContainer.style.boxSizing = "border-box";
    textContainer.style.pointerEvents = "auto";

    // Custom scrollbar styling
    textContainer.style.scrollbarWidth = "thin";
    textContainer.style.scrollbarColor = "#edcf8eff transparent";

    // Add content
    const content = document.createElement("div");
    content.style.fontFamily = "'Dancing Script', cursive";
    content.style.fontSize = "16px";
    content.style.lineHeight = "1.8";
    content.style.color = "#2c1810";
    content.style.whiteSpace = "pre-wrap";
    content.style.wordWrap = "break-word";
    content.style.textAlign = "left";
    content.innerText = message;

    // Add signature
    const signature = document.createElement("div");
    signature.style.marginTop = "30px";

    textContainer.appendChild(content);

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "✕";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.width = "30px";
    closeButton.style.height = "30px";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "50%";
    closeButton.style.backgroundColor = "#90255bff";
    closeButton.style.color = "white";
    closeButton.style.fontSize = "18px";
    closeButton.style.fontWeight = "bold";
    closeButton.style.cursor = "pointer";
    closeButton.style.display = "flex";
    closeButton.style.alignItems = "center";
    closeButton.style.justifyContent = "center";
    closeButton.style.pointerEvents = "auto";
    closeButton.style.transition = "all 0.2s ease";
    closeButton.style.zIndex = "1001";

    // Hover effect
    closeButton.onmouseenter = () => {
        closeButton.style.backgroundColor = "#c0307aff";
        closeButton.style.transform = "scale(1.1)";
    };
    closeButton.onmouseleave = () => {
        closeButton.style.backgroundColor = "#90255bff";
        closeButton.style.transform = "scale(1)";
    };

    // Close functionality
    closeButton.onclick = () => {
        if (onClose) {
            onClose(); // Destroy letter sprites
        }
        removeMessageOverlay(messageOverlay);
    };

    messageOverlay.appendChild(textContainer);
    messageOverlay.appendChild(closeButton);

    return messageOverlay;
}

/**
 * Removes the message overlay from the DOM
 * @param {HTMLElement} overlay - The overlay element to remove
 */
export function removeMessageOverlay(overlay) {
    if (overlay && overlay.parentNode) {
        document.body.removeChild(overlay);
    }
}
