
var candidates = [
    "What is object detection?",
    "What is instance segmentation?",
    "Does YOLOv8 object detection take polygon annotations?",
    "Does Roboflow iOS deployment support classification models?",
    "Instance vs semantic segmentation",
    "Polygon vs bounding box",
    "How does YOLOv8 work?",
    "What is object detection?"
];

var list = document.querySelectorAll("li");
var i = 0;

function fadeIn() {
    var link = list[i].querySelector("a");
    var opacity = 0.15;
    var currentPrompt = candidates[Math.floor(Math.random() * candidates.length)];
    link.style.display = "flex";
    link.innerHTML = currentPrompt;

    link.setAttribute('data-prompt', currentPrompt);
    function increaseOpacity() {
        if (opacity >= 0.8) {
            return;
        }
        link.style.opacity = opacity;
        opacity += 0.02; // Adjust the increment to control speed
        requestAnimationFrame(increaseOpacity);
    }

    link.style.opacity = 0;
    requestAnimationFrame(increaseOpacity);
}

function fadeOut(callback) {
    var link = list[i].querySelector("a");
    var opacity = 1;

    function decreaseOpacity() {
        if (opacity <= 0.1) {
            link.style.display = "none";
            if (callback) {
                callback(); // Call the callback function after fadeOut
            }
            return;
        }
        link.style.opacity = opacity;
        opacity -= 0.02; // Adjust the decrement to control speed
        requestAnimationFrame(decreaseOpacity);
    }

    requestAnimationFrame(decreaseOpacity);
}

function changeListItem() {
    i = Math.floor(Math.random() * list.length);
    fadeOut(fadeIn); // Call fadeIn as a callback after fadeOut
    setTimeout(changeListItem, 5000); // Adjust the timeout to control the transition speed
}

changeListItem();