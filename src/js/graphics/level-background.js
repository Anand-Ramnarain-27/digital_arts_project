LEVEL_BACKGROUND_PATTERN = createCanvasPattern(evaluate(CELL_SIZE * 4), evaluate(CELL_SIZE * 6), (c, can) => {
    c.fs('#000');
    c.globalAlpha = 0.05;

    // Horizontal ridges
    c.fr(0, 0, evaluate(CELL_SIZE * 4), 2);
    c.fr(0, evaluate(CELL_SIZE * 3), evaluate(CELL_SIZE * 4), 2);

    // Vertical ridges
    c.fr(0, 0, 2, CELL_SIZE * 3);
    c.fr(evaluate(CELL_SIZE * 2), evaluate(CELL_SIZE * 3), 2, CELL_SIZE * 10);
});

LEVEL_COLORS = [
   '#29c2fd', // Neon Blue
    '#ffbb33', // Neon Orange
    '#00ffcc', // Neon Cyan
    '#ff0066', // Neon Pink
    '#39ff14'  // Neon Green
];

darken = (color, amount = 0.5) => {
    const num = parseInt(color.slice(1), 16);
    let r = (num >> 16);
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    return '#' + (amount * r << 16 | amount * g << 8 | amount * b).toString(16).padStart(6, '0');
};

createLevelBackground = (level) => createCanvas(LEVEL_WIDTH, LEVEL_WIDTH, (c, can) => {
    c.fs('#000'); // Black background for the level
    c.fr(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

    // Neon glow pattern
    c.fs(LEVEL_BACKGROUND_PATTERN);
    c.fr(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

    // Neon Radial Gradient for soft glow effect
    const neonGlow = c.createRadialGradient(LEVEL_WIDTH / 2, LEVEL_HEIGHT / 2, 0, LEVEL_WIDTH / 2, LEVEL_HEIGHT / 2, LEVEL_WIDTH);
    neonGlow.addColorStop(0, 'rgba(0,255,255,0.1)'); // Soft neon center
    neonGlow.addColorStop(1, 'rgba(0,255,255,0)');   // Fade out glow

    c.fs(neonGlow);
    c.fr(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

    const rng = createNumberGenerator(1);

    const matrix = level.definition.matrix;

    // Map of spots that are already taken by a detail
    const taken = matrix.map((arr) => arr.slice());

    const [messageRow] = level.definition.message || [0]

    // No detail on the spawn
    // taken[level.definition.exit[0]][level.definition.exit[1]] = true;

    for (let row = 1 ; row < LEVEL_ROWS - 1 ; row++) {
        for (let col = 1 ; col < LEVEL_ROWS - 1 ; col++) {
            if (
                taken[row][col] ||
                abs(row - messageRow) < 1 ||
                abs(row - level.definition.exit[0]) < 2 && abs(col - level.definition.exit[1]) < 2
            ) {
                continue;
            }

            const maybeAdd = (image, prerender) => {
                if (rng.floating() > 0.2) {
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

                //
                const x = toCellCoord(col);
                const y = toCellCoord(row);

                // Maybe do some prerendering
                if (prerender) {
                    prerender(x, y);
                }

                // Render the detail
                c.drawImage(
                    image,
                    x,
                    y
                );
            }

            const current = taken[row][col];
            const right = taken[row][col + 1];
            const below = taken[row + 1][col];
            const above = taken[row - 1][col];
            const belowBelow = taken[row + 2] && taken[row + 2][col];
            const belowRight = taken[row + 1][col + 1];
        }
    }
});
