//touch.js
ontouchstart = ontouchmove = ontouchend = ontouchcancel = e => {
    down = {};

    e.preventDefault();

    const canvasCoords = CANVAS.getBoundingClientRect();
    for (let i = 0 ; i < e.touches.length ; i++) {
        const x = CANVAS_WIDTH * (e.touches[i].pageX - canvasCoords.left) / canvasCoords.width;
        const buttonIndex = ~~(x / (CANVAS_WIDTH / 6));
        down[KEYBOARD_LEFT] = down[KEYBOARD_LEFT] || buttonIndex == 0;
        down[KEYBOARD_RIGHT] = down[KEYBOARD_RIGHT] || buttonIndex == 1;
        down[KEYBOARD_SPACE] = down[KEYBOARD_SPACE] || between(2, buttonIndex, 3);
        down[KEYBOARD_G] = down[KEYBOARD_G] || between(3.1, buttonIndex, 4); 
        down[KEYBOARD_E] = down[KEYBOARD_E] || between(4.1, buttonIndex, 5); 
    }
};

