SKY_BACKGROUND = createCanvasPattern(200, CANVAS_HEIGHT, (c) => {
    const g = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    g.addColorStop(0, '#00032c');
    g.addColorStop(0.7, '#14106f');
    g.addColorStop(1, '#64196c');

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
    c.fillRect(can.width / 4, can.height / 4, can.width / 2, can.width / 2);
});

BUILDINGS_BACKGROUND = createCanvasPattern(800, 400, (c, can) => {
    c.fillStyle = WINDOW_PATTERN;

    c.fillRect(
        0,
        0,
        can.width,
        can.height
    );
});

FRAME = padCanvas(1, 1, 0.5, createCanvas(CELL_SIZE * 0.6, CELL_SIZE * 0.8, (c, can) => {
    c.fillStyle = '#925e2a';
    c.fillRect(0, 0, 99, 99);
    c.fillStyle = '#fcf3d7';
    c.fillRect(4, 4, can.width - 8, can.height - 8);
    c.fillStyle = '#ccc';
    c.fillRect(can.width / 2 - 5, can.height / 2 - 5, 10, 10);
}));

WINDOW = padCanvas(2, 1, 0.5, createCanvas(CELL_SIZE * 0.8, CELL_SIZE * 1.2, (c, can) => {
    c.fillStyle = '#494742';
    c.fillRect(0, 0, 99, 99);
    c.fillStyle = '#b8c8fa';
    c.fillRect(2, 2, can.width - 4, can.height - 4);

    c.fillStyle = '#494742';
    c.fillRect(0, can.height * 0.7, can.width, 4);
}));

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

TRASH = padCanvas(1, 1, 1, createCanvas(CELL_SIZE * 0.3, CELL_SIZE * 0.4, (c, can) => {
    c.fillStyle = '#4c80be';
    c.fillRect(0, 0, 99, 99);
    c.fillStyle = '#78a1d6';
    c.fillRect(0, 0, 99, 4);
}));

OUTLET = padCanvas(1, 1, 0.75, createCanvas(CELL_SIZE * 0.2, CELL_SIZE * 0.2, (c, can) => {
    c.fillStyle = '#fff';
    c.fillRect(0, 0, 99, 99);
}));

LIGHT = padCanvas(3, 10, 0, createCanvas(CELL_SIZE * 5, CELL_SIZE * 3, (c, can) => {
    const g = c.createRadialGradient(can.width / 2, 0, 0, can.width / 2, 0, can.height);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    // g.addColorStop(0, 'red');
    // g.addColorStop(1, 'blue');

    c.fillStyle = g;

    // c.fillStyle = '#fff';
    c.beginPath();
    c.moveTo(can.width / 2, 0);
    c.arc(can.width / 2, 0, can.height, PI / 6, PI * 5 / 6, false);
    c.fill();
}));

LEVEL_BACKGROUND = createCanvasPattern(CELL_SIZE * 4, CELL_SIZE * 6, (c, can) => {
    c.fillStyle = '#29c2fd';
    c.fr(0, 0, can.width, can.height);

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

    const possibleDetails = [];

    for (let row = 1 ; row < LEVEL_ROWS - 1 ; row++) {
        for (let col = 1 ; col < LEVEL_ROWS - 1 ; col++) {
            if (taken[row][col]) {
                continue;
            }

            const maybeAdd = (image) => {
                return () => {
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
                };
            }

            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;

            const current = taken[row][col];
            const right = taken[row][col + 1];
            const below = taken[row + 1][col];
            const above = taken[row - 1][col];
            const belowBelow = taken[row + 2] && taken[row + 2][col];
            const belowRight = taken[row + 1][col + 1];

            const cellDetails = [];

            // Trash and outlets just need floor
            if (!current && below) {
                cellDetails.push(maybeAdd(TRASH));
                cellDetails.push(maybeAdd(OUTLET));
            }

            // Lights need a ceiling to hang onto
            if (matrix[row - 1][col] && !matrix[row][col] && !matrix[row + 1][col] && !(col % 2)) {
                // No need to take extra room for lights
                c.drawImage(
                    LIGHT,
                    (col + 0.5) * CELL_SIZE - LIGHT.width / 2,
                    row * CELL_SIZE
                );
            }

            // Frames and windows need two rows
            if (!below && belowBelow) {
                cellDetails.push(maybeAdd(FRAME));
                cellDetails.push(maybeAdd(WINDOW));
            }

            // Desks need one row but two columns
            if (below && !right && belowRight) {
                cellDetails.push(maybeAdd(DESK));
            }

            if (cellDetails.length) {
                possibleDetails.push(cellDetails);
            }
        }
    }

    const allDetails = possibleDetails.flat();
    allDetails.forEach(detail => {
        if (rng.floating() < 0.15) {
            detail();
        }
    });

    // possibleDetails.forEach((details) => {
    //     if (rng.floating() < 0.5) {
    //         rng.pick(details)();
    //     }
    // });
});