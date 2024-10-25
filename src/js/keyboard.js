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

    if (INPUT.emp()) {  // 69 is the keyCode for 'E'
        G.activateEMP();
    }

    if (INPUT.gravity()) {  // 71is the keyCode for 'G'
        console.log('The G button was pressed');
        G.inverseGravity();
    }
};
onkeyup = e => {
    down[e.keyCode] = false;
};
onblur = oncontextmenu = () => down = {};

