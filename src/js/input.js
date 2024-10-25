//input.js
INPUT = {
    'jump': () => down[KEYBOARD_SPACE] || down[KEYBOARD_UP] || down[KEYBOARD_W] || down[KEYBOARD_Z] || isGamepadButtonPressed(0) || isGamepadButtonPressed(1),
    'left': () => down[KEYBOARD_LEFT] || down[KEYBOARD_A] || isGamepadButtonPressed(14) || isGamepadAxisNearValue(0, -1),
    'right': () => down[KEYBOARD_RIGHT] || down[KEYBOARD_D] || isGamepadButtonPressed(15) || isGamepadAxisNearValue(0, 1),
    'emp':() => down[KEYBOARD_E] || isGamepadButtonPressed(2),
    'gravity':() => down[KEYBOARD_G] || down[KEYBOARD_Q] || isGamepadButtonPressed(3) 

};
