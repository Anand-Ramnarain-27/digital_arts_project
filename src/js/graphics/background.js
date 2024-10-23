//background.js
const BUILDINGS_BACKGROUND = [
    ['#000', 450],
].map(([color, patternHeight]) => createCanvasPattern(400, patternHeight, (c, can) => {
    c.fs(color); // Fill with black color

    const rng = createNumberGenerator(patternHeight * 5);

    let x = 0;
    while (x < can.width) {
        const buildingWidth = ~~rng.between(80, 120);
        const buildingHeight = rng.floating() * 200;

        // Draw the glowing outline
        c.fs('#00f'); // Tron blue color
        c.fr(x - 2, buildingHeight-2, buildingWidth + 4, patternHeight + 4); // Slightly larger for glow effect

        // Draw the building itself
        c.fs(color);
        c.fr(x, buildingHeight, buildingWidth, patternHeight); // Draw building on top

        x += buildingWidth;
    }
}));

const tronColors = [
    '#00f',
    '#00f',
    '#00f',
    '#00f',
    // '#00FFFF', // Cyan
    // '#FF4500',
    // '#00BFFF', // Deep Sky Blue
    // '#FF1493', // Deep Pink
    // '#1E90FF', // Dodger Blue
    // '#FF00FF', // Magenta
    // '#0000FF', // Blue
    // '#FFFF00', // Yellow
    // '#8A2BE2', // Blue Violet
    // '#ADFF2F', // Green Yellow
];

BUILDINGS_BACKGROUNDS = [
     ['#000', 650],
     ['#000', 500],
     ['#000', 300]
].map(([color, patternHeight]) => createCanvasPattern(400, patternHeight, (c, can) => {
    c.fs(color);

    const rng = createNumberGenerator(patternHeight * 5);

    let x = 0;
    let colorIndex = 0;
    while (x < can.width) {
        const buildingWidth = ~~rng.between(80, 120);
        const buildingHeight = rng.floating() * 200;

        // Get the Tron color for the outline
        const outlineColor = tronColors[colorIndex % tronColors.length];
        
        // Draw the glowing outline
        c.fs(outlineColor); // Use the Tron color
        c.fr(x - 2, buildingHeight - 2, buildingWidth + 4, patternHeight + 4); // Outline rectangle

        // Draw the building itself
        c.fs(color);
        c.fr(x, buildingHeight, buildingWidth, patternHeight); // Building rectangle

        x += buildingWidth;
        colorIndex++;
    }
}));

SKY_BACKGROUND = createCanvas(1, CANVAS_HEIGHT, (c) => {
    const gradient = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#000');
    gradient.addColorStop(0.7, '#000');
    return gradient;
});



