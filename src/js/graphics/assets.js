SKY_BACKGROUND = createCanvasPattern(200, CANVAS_HEIGHT, (c) => {
    const g = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    g.addColorStop(0, '#000');
    g.addColorStop(0.7, '#000');
    g.addColorStop(1, '#000');

    c.fillStyle = g;
    c.fr(0, 0, 200, CANVAS_HEIGHT);
});

GOD_RAY = createCanvas(CELL_SIZE * 0.6, CELL_SIZE * 4, (c, can) => {
    const g = c.createLinearGradient(0, 0, 0, CELL_SIZE * 4);
    g.addColorStop(0, 'rgba(255,255,255, 0)');
    g.addColorStop(0.5, 'rgba(255,255,255, 0.5)');
    g.addColorStop(1, 'rgba(255,255,255, 0)');

    c.fillStyle = g;
    c.fillRect(0, 0, 99, 999);
});

HALO = createCanvas(CELL_SIZE * 4, CELL_SIZE * 4, (c, can) => {
    const g = c.createRadialGradient(can.width / 2, can.height / 2, 0, can.width / 2, can.height / 2, can.width / 2);
    g.addColorStop(0.5, 'rgba(255,255,255, 0.5)');
    g.addColorStop(1, 'rgba(255,255,255, 0)');

    c.fillStyle = g;
    c.fillRect(0, 0, 999, 999);
});

COMPUTER = createCanvas(CELL_SIZE * 0.6, CELL_SIZE * 0.6, (c, can) => {
    c.fillStyle = '#000';
    c.fr(0, 0, 99, 99);

    c.fillStyle = '#a9a9a9';
    // c.fr(2, 2, can.width - 4, 20);
    c.fr(2, 2, can.width - 4, can.height - 4);

    c.fillStyle = '#4253ff';
    c.fr(4, 4, can.width - 8, can.height - 12);

    c.fillStyle = '#000';
    c.fr(4, can.height - 6, can.width - 8, 2);

    c.fillStyle = '#a5dc40';
    c.fr(can.width - 6, can.height - 6, 2, 2);

    // document.body.appendChild(can);
});

WINDOW_PATTERN = createCanvasPattern(CELL_SIZE * 2, CELL_SIZE * 2, (c, can) => {
    c.fillStyle = '#8c9bee';
    c.fillRect(0, 0, 999, 999);

    c.fillStyle = '#f29afb';
    c.fillRect(can.width / 10, can.height / 4, can.width * 8 / 10, can.height / 2);
});

BUILDING_PATTERN = createCanvasPattern(CELL_SIZE * LEVEL_COLS, CELL_SIZE * 8, (c, can) => {
    c.fillStyle = '#adbbff';
    c.fillRect(0, 0, can.width, 999);

    // c.translate(CELL_SIZE / 4, CELL_SIZE / 4);

    c.fillStyle = WINDOW_PATTERN;
    c.fillRect(0, CELL_SIZE / 4, can.width, can.height - CELL_SIZE / 2);
});

SIGN_HOLDER_PATTERN = createCanvasPattern(CELL_SIZE * 2, CELL_SIZE * 2, (c, can) => {
    c.fillStyle = c.strokeStyle = '#111';
    c.lineWidth = 4;
    c.fr(0, 0, 99, 99);
    c.clearRect(4, 4, can.width - 8, can.height - 8);

    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(99, 99);
    c.moveTo(can.width, 0);
    c.lineTo(0, can.height);
    c.stroke();
});

createBuildingsBackground = (color, patternHeight) => createCanvasPattern(400, patternHeight, (c, can) => {
    c.fillStyle = color;

    let x = 0;
    while (x < can.width) {
        const buildingWidth = ~~rnd(80, 120);
        c.fr(x, random() * 200, buildingWidth, patternHeight);
        x += buildingWidth;
    }
    // for (let x = 0 ; x < can.width ; x += rnd(100, 110)) {
    //     c.fr(x, random() * can.height * 0.8, 100, patternHeight);
    // }
});

BUILDINGS_BACKGROUND = [
    createBuildingsBackground('#000', 600),
    createBuildingsBackground('#000', 500),
    createBuildingsBackground('#000', 300)
];


UNPADDED_DESK = createCanvas(CELL_SIZE * 1.1, CELL_SIZE * 0.5, (c, can) => {
    // Legs
    c.fillStyle = '#000';
    c.fillRect(2, 0, 2, can.height);
    c.fillRect(can.width - 2, 0, -2, can.height);

    // Top
    c.fillStyle = '#494742';
    c.fillRect(0, 0, 99, 4);

    // Drawers
    c.fillStyle = '#ccc';
    c.fillRect(4, 4, can.width / 4, can.height / 3);
    c.fillRect(can.width - 4, 4, -can.width / 4, can.height / 3);
});

DESK = padCanvas(1, 2, 1, UNPADDED_DESK);

LEVEL_BACKGROUND = createCanvasPattern(CELL_SIZE * 4, CELL_SIZE * 6, (c, can) => {
    c.fillStyle = '#000';
    c.globalAlpha = 0.05;

    // Horizontal ridges
    c.fr(0, 0, can.width, 2);
    c.fr(0, CELL_SIZE * 3, can.width, 2);

    // Vertical ridges
    c.fr(0, 0, 2, CELL_SIZE * 3);
    c.fr(CELL_SIZE * 2, CELL_SIZE * 3, 2, CELL_SIZE * 10);
});

createLevelBackground = (level) => createCanvas(CELL_SIZE * LEVEL_COLS, CELL_SIZE * LEVEL_ROWS, (c, can) => {
    c.fillStyle = LEVEL_BACKGROUND;
    c.fr(0, 0, can.width, can.height);

    const rng = createNumberGenerator(1);

    const matrix = level.definition.matrix;

    // Map of spots that are already taken by a detail
    const taken = matrix.map((arr) => arr.slice());

    // No detail on the spawn
    taken[level.definition.exit[0]][level.definition.exit[1]] = true;

    const allDetails = [];

    for (let row = 1 ; row < LEVEL_ROWS - 1 ; row++) {
        for (let col = 1 ; col < LEVEL_ROWS - 1 ; col++) {
            if (taken[row][col]) {
                continue;
            }

            const maybeAdd = (image) => {
                if (rng.floating() > 0.15) {
                    return;
                }

                // return () => {
                // Make sure the spot is free
                for (let takenRow = 0 ; takenRow < image.height / CELL_SIZE ; takenRow++) {
                    for (let takenCol = 0 ; takenCol < image.width / CELL_SIZE ; takenCol++) {
                        if (taken[row + takenRow][col + takenCol]) {
                            return;
                        }
                    }
                }

                // Mark them as taken
                for (let takenRow = 0 ; takenRow < image.height / CELL_SIZE ; takenRow++) {
                    for (let takenCol = 0 ; takenCol < image.width / CELL_SIZE ; takenCol++) {
                        taken[row + takenRow][col + takenCol] = true;
                    }
                }

                // Render the detail
                c.drawImage(
                    image,
                    col * CELL_SIZE,
                    row * CELL_SIZE
                );
            }

            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;

            const current = taken[row][col];
            const right = taken[row][col + 1];
            const below = taken[row + 1][col];
            const above = taken[row - 1][col];
            const belowBelow = taken[row + 2] && taken[row + 2][col];
            const belowRight = taken[row + 1][col + 1];

            // Desks need one row but two columns
            if (below && !right && belowRight) {
                maybeAdd(DESK);
            }
        }
    }

    allDetails.forEach(detail => {
        if (rng.floating() < 0.15) {
            detail();
        }
    });
});