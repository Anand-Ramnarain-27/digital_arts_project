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

    if (e.keyCode == 69) {  // 69 is the keyCode for 'E'
        G.activateEMP();
    }

    if (e.keyCode == 71) {  // 71is the keyCode for 'G'
        console.log('The G button was pressed');
    }
};
onkeyup = e => {
    down[e.keyCode] = false;
};
onblur = oncontextmenu = () => down = {};

