BUILDINGS_BACKGROUND = [
    ['#000', 600],
    ['#000', 500],
    ['#000', 300]
].map(([color, patternHeight]) => createCanvasPattern(400, patternHeight, (c, can) => {
    c.fs(color);

    const rng = createNumberGenerator(patternHeight * 5);

    let x = 0;
    while (x < can.width) {
        const buildingWidth = ~~rng.between(80, 120);
        c.fr(x, rng.floating() * 200, buildingWidth, patternHeight);
        x += buildingWidth;
    }
}));

SKY_BACKGROUND = createCanvas(1, CANVAS_HEIGHT, (c) => {
    const gradient = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#000');
    gradient.addColorStop(0.7, '#000');
    return gradient;
});
