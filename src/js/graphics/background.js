BUILDINGS_BACKGROUND = [
    ['#000', 600],
    ['#000', 500],
    ['#000', 300]
].map(([color, patternHeight]) => createCanvasPattern(400, patternHeight, (c, can) => {
    c.fillStyle = color;

    let x = 0;
    while (x < can.width) {
        const buildingWidth = ~~rnd(80, 120);
        c.fr(x, random() * 200, buildingWidth, patternHeight);
        x += buildingWidth;
    }
}));

SKY_BACKGROUND = createCanvasPattern(1, CANVAS_HEIGHT, (c) => {
    const g = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    g.addColorStop(0, '#000');
    g.addColorStop(0.7, '#000');
    g.addColorStop(1, '#000');

    c.fillStyle = g;
    c.fr(0, 0, 200, CANVAS_HEIGHT);
});