class Game {

    constructor() {
        G = this;
        G.clock = 0;

        this.altitude = 0;

        this.level = LEVELS[0];
        this.startLevel(this.level);
    }

    cycle(e) {
        this.clock += e;

        this.level.cycle(e);
        INTERPOLATIONS.slice().forEach(i => i.cycle(e));

        if (this.menu) {
            this.menu.cycle(e);
        }

        this.render();
    }

    nextLevel() {
        // Stop the previous level
        this.level.stop();

        // Start the new one
        this.startLevel(LEVELS[this.level.index + 1]);
    }

    startLevel(level) {
        this.level = level;
        this.centerLevel(this.level);
        this.level.start();
    }

    centerLevel(level) {
        const levelHeight = LEVEL_ROWS * CELL_SIZE;
        const towerBaseHeight = (CANVAS_HEIGHT - levelHeight) / 2;
        // this.altitude = this.levelY(level) - towerBaseHeight;

        interp(this, 'altitude', this.altitude, this.levelY(level) - towerBaseHeight, 0.5)
    }

    levelY(level) {
        const levelHeight = LEVEL_ROWS * CELL_SIZE;
        const towerBaseHeight = (CANVAS_HEIGHT - levelHeight) / 2;
        const levelBottomY = CANVAS_HEIGHT - level.index * levelHeight - towerBaseHeight;

        return levelBottomY - levelHeight;
    }

    // renderOneBuilding(x, altitude) {
    //     wrap(() => {
    //         translate(x, altitude);
    //         R.fillStyle = WINDOW_PATTERN;
    //
    //         fs(0, 0);
    //     });
    // }

    render() {
        const levelWidth = LEVEL_COLS * CELL_SIZE;
        const levelHeight = LEVEL_ROWS * CELL_SIZE;
        const levelX = (CANVAS_WIDTH - LEVEL_COLS * CELL_SIZE) / 2;

        // Sky
        R.fillStyle = SKY_BACKGROUND;
        fr(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // TODO maybe split into two?

        R.fillStyle = '#fff';
        beginPath();
        arc(CANVAS_WIDTH - 200, 100, 50, 0, PI * 2, true);
        fill();

        // Buildings
        // const xRatio = this.level.player.x / (CELL_SIZE * LEVEL_COLS);
        // const xRatioFromCenter = xRatio - 0.5;
        // const perspective = xRatioFromCenter * 80;
        //
        // R.fillStyle = WINDOW_PATTERN;
        // wrap(() => {
        //     translate(levelX, 0);
        //     scale(xRatioFromCenter, 1);
        //     fr(0, 0, 120, CANVAS_HEIGHT);
        // });
        // wrap(() => {
        //     translate(levelX + CELL_SIZE * LEVEL_COLS, 0);
        //     scale(-xRatioFromCenter, 1);
        //     fr(0, 0, -120, CANVAS_HEIGHT);
        // });

        wrap(() => {
            translate(0, -this.altitude);

            R.fillStyle = '#000';
            fr(levelX, 0, levelWidth, CANVAS_HEIGHT);

            const currentLevelIndex = LEVELS.indexOf(this.level);
            for (let i = max(0, currentLevelIndex - 1) ; i < min(LEVELS.length, currentLevelIndex + 2) ; i++) {
                wrap(() => {
                    translate(levelX, this.levelY(LEVELS[i]));
                    LEVELS[i].render();
                });
            }
        });

        if (this.menu) {
            wrap(() => this.menu.render());
        }


        if (DEBUG) {
            wrap(() => {
                R.font = '24pt Arial';
                R.textAlign = 'left';
                fs('#fff');

                const fpsGauge = [];
                for (let i = 0 ; i < (G.fps / 60) * 20 ; i++) {
                    fpsGauge.push('-');
                }

                const info = [
                    'fps: ' + G.fps,
                    fpsGauge.join(''),
                ];
                let y = 40;
                info.forEach(info => {
                    fillText(info, 40, y);
                    y += 40;
                });
            });
        }
    }

}