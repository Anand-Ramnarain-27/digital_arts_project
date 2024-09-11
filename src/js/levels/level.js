class Level {
    constructor(index, definition) {
        this.index = index;
        this.definition = definition;

        this.stop();
    }

    endWith(f) {
        if (!this.ended) {
            this.ended = true;
            f();
        }
    }

    foundExit() {
        this.endWith(() => {
            const hasNextLevel = LEVELS[this.index + 1];
            G.menu = new Menu(
                nomangle('Infiltrating Core Systems...'),
                hasNextLevel ? nomangle('Breach Successful') : nomangle('TOOK DOWN THE SYSTEM!')
            );
            G.menu.animateIn();

            setTimeout(() => {
                G.menu.animateOut();
            }, 2000);

            setTimeout(() => {
                if (hasNextLevel) {
                    G.nextLevel();
                } else {
                    G.endAnimation();
                }
            }, 2500);
        });
    }

    wasFound() {
        this.endWith(() => {
            G.menu = new Menu(
                nomangle('Breach Unsuccessful!'),
                nomangle('PRESS [SPACE] TO TRY AGAIN')
            );
            G.menu.animateIn();
        });

        setTimeout(() => this.waitingForRetry = true, 1000);
    }

    prepare() {
        this.ended = false;
        this.started = false;

        this.clock = 0;

        this.cyclables = [];
        this.renderables = [];

        this.player = new Player(
            this,
            toMiddleCellCoord(this.definition.spawn[1]),
            toMiddleCellCoord(this.definition.spawn[0])
        );
        this.cyclables.push(this.player);

        const exit = new Exit(
            this,
            toMiddleCellCoord(this.definition.exit[1]),
            toMiddleCellCoord(this.definition.exit[0])
        );
        this.cyclables.push(exit);
        this.renderables.push(exit);

        this.definition.cameras.forEach(cameraDefinition => {
            const camera = new Camera(this, cameraDefinition);
            this.cyclables.push(camera);
            this.renderables.push(camera);
        });

        this.definition.guards.forEach(guardDefinition => {
            const guard = new Guard(this, guardDefinition);
            this.cyclables.push(guard);
            this.renderables.push(guard);
        });

        // Give cyclables a cycle so they're in place
        this.cyclables.forEach((cyclable) => {
            cyclable.cycle(0);
        });
    }

    start() {
        this.started = true;

        this.player.spawn();
        this.renderables.push(this.player);
    }

    stop() {
        this.cyclables = [];
        this.renderables = [];
    }

    cycle(e) {
        if (this.started && !this.ended) {
            this.clock += e;
            this.cyclables.forEach(x => x.cycle(e));
        }

        if (down[KEYBOARD_SPACE] && this.waitingForRetry) {
            this.waitingForRetry = false;
            G.menu.animateOut();

            this.prepare();
            this.start(); // TODO maybe a quick delay
        }
    }

    render() {
        this.background = this.background || createLevelBackground(this);
        drawImage(this.background, 0, 0);

        if (DEBUG && getDebugValue('grid')) {
            R.fillStyle = 'rgba(0,0,0,0.2)';
            for (let k = 0 ; k < LEVEL_ROWS ; k++) {
                fr(0, k * CELL_SIZE, LEVEL_COLS * CELL_SIZE, 1);
                fr(k * CELL_SIZE, 0, 1, LEVEL_ROWS * CELL_SIZE);
            }

            R.fillStyle = '#fff';
            R.textAlign = 'center';
            R.textBaseline = 'middle';
            for (let row = 0 ; row < LEVEL_ROWS ; row++) {
                for (let col = 0 ; col < LEVEL_ROWS ; col++) {
                    fillText(
                        `${row}-${col}`,
                        toMiddleCellCoord(col),
                        toMiddleCellCoord(row)
                    );
                }
            }
        }

        // Renderables
        this.renderables.forEach(x => wrap(() => x.render()));

        // Matrix
        R.fillStyle = '#111';
        for (let row = 0 ; row < LEVEL_ROWS ; row++) {
            for (let col = 0 ; col < LEVEL_ROWS ; col++) {
                if (this.definition.matrix[row][col]) {
                    fr(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }

        // Message
        R.textAlign = 'center';
        R.textBaseline = 'middle';
        R.fillStyle = 'rgba(255,255,255,0.5)';
        R.font = '30pt Impact';
        fillText(this.definition.message || '', LEVEL_WIDTH / 2, 100);
    }

    particle(properties) {
        let particle;
        properties.onFinish = () => remove(this.renderables, particle);
        this.renderables.push(particle = new Particle(properties));
    }

}