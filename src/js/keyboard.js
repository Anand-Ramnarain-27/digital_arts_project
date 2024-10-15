//keyboard.js
down = {};
onkeydown = e => {
    down[e.keyCode] = true;

    if (e.keyCode == KEYBOARD_K) {
        G.changeDifficulty();
        beepSound();
    }

    if (e.keyCode == 27 && G.isStarted && G.timerActive && confirm(nomangle('Exit?'))) {
        G.mainMenu();
    }
};
onkeyup = e => {
    down[e.keyCode] = false;
};
onblur = oncontextmenu = () => down = {};

