//game.js
const HACKER_POSITION = {
    'x': LEVEL_WIDTH / 2 + 30,
    'y': -PLAYER_RADIUS
};
const TITLE_FONT = italicFont(120);
const INTER_TITLE_FONT = italicFont(24);

const buildingVisibilityThresholds = [MAX_LEVEL_ALTITUDE, MAX_LEVEL_ALTITUDE * 0.75, MAX_LEVEL_ALTITUDE * 0.5];

class Game {

    constructor() {
        G = this;
        G.clock = 0;

        G.timer = 0;
        G.timerActive = false;

        G.difficulty = NORMAL_DIFFICULTY;
        G.wasDifficultyChangedDuringRun = false;
        G.difficultyPromptShown = false;

        G.level = LEVELS[0];
        G.level.prepare();

        G.renderables = [];

        G.bottomScreenAltitude = MAX_LEVEL_ALTITUDE + LEVEL_HEIGHT - CANVAS_HEIGHT / 2 + 100;
        G.windowsAlpha = 1;

        G.introAlpha = 1;
        G.mainTitleAlpha = 1;
        G.mainTitleYOffset = 1;
        G.interTitleYOffset = 1;

        G.bandanaSource = {'x': HACKER_POSITION.x, 'y': HACKER_POSITION.y - 10};
        G.bandanaTrail = Array(~~(MAX_BANDANA_LENGTH / MAIN_MENU_BANDANA_X_INTERVAL)).fill(0).map((x, i) => {
            return { 'x': G.bandanaSource.x + PLAYER_RADIUS / 2 + i * MAIN_MENU_BANDANA_X_INTERVAL};
        })

        G.mainTitle = nomangle('HACKER');
        G.interTitle = nomangle('VS');

        interp(G, 'introAlpha', 1, 0, 1, 2);
        interp(G, 'mainTitleYOffset', -CANVAS_HEIGHT , 0, 0.3, 0.5, null, () => {
            G.shakeTitleTime = 0.1;

            R.font = TITLE_FONT;
            G.dust(measureText(G.mainTitle).width / 2, TITLE_Y + 50, 100);
        });
        interp(G, 'interTitleYOffset', CANVAS_HEIGHT, 0, 0.3, 1, null, () => {
            G.shakeTitleTime = 0.1;

            R.font = INTER_TITLE_FONT;
            G.dust(measureText(G.interTitle).width / 2, INTER_TITLE_Y - 20, 5);
        });

        // Matrix effect properties
        this.matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}".split("");
        this.fontSize = 10;
        this.columns = Math.floor(CANVAS_WIDTH / this.fontSize);
        this.drops = Array(this.columns).fill(1); // Start all drops at y = 1

        this.isEMPActive = false;
        this.empDuration = 5000; 
    }

    activateEMP() {
        if (!this.isEMPActive) {
            this.isEMPActive = true;

            // Disable cameras, guards, and lights
            G.level = LEVELS[G.level.index];
            G.level.activatesEMP();


            // // Set a timeout to deactivate EMP after the duration
            setTimeout(() => this.deactivatesEMP(), this.empDuration);
        }
    }

    deactivatesEMP() {
        this.isEMPActive = false;

        // Re-enable the detection systems
        G.level = LEVELS[G.level.index];
        G.level.deactivatesEMP();
    }

    dust(spreadRadius, y, count) {
        for (let i = 0 ; i < count ; i++) {
            G.particle({
                'size': [16],
                'color': '#fff',
                'duration': rnd(0.4, 0.8),
                'x': [CANVAS_WIDTH / 2 + rnd(-spreadRadius, spreadRadius), rnd(-40, 40)],
                'y': [y + rnd(-10, 10), rnd(-15, 15)]
            });
        }
    }

    changeDifficulty() {
        if (G.isStarted) {
            G.wasDifficultyChangedDuringRun = true;
        }

        const settings = difficultySettings();
        const currentDifficultyIndex = settings.indexOf(G.difficulty);
        G.difficulty = settings[(currentDifficultyIndex + 1) % settings.length];
    };

    startAnimation() {
        if (G.isStarted) {
            return;
        }

        G.isStarted = true;

        G.timer = 0;

        G.wasDifficultyChangedDuringRun = false;
        G.queuedTweet = null;

        G.level = LEVELS[0];
        G.level.prepare();

        // Fade the title and intertitle out
        interp(G, 'mainTitleAlpha', 1, 0, 0.5);

        // Center the level, hide the windows, then start it
        G.centerLevel(
            G.level.index,
            5,
            0.5,
            () => {
                // Hide the windows, then start the level
                interp(G, 'windowsAlpha', 1, 0, 1, 0, null, () => {
                    G.timerActive = true;
                    G.level.start()
                });
            }
        )

        setTimeout(() => {
            G.menu = new Menu(
                nomangle('INFILTRATE THE SYSTEM'),
                nomangle('DESTORY IT ALL')
            );
            G.menu.dim = false;
            G.menu.animateIn();

            setTimeout(() => G.menu.animateOut(), 3000);
        }, 1000);

        beepSound();
    }

    get bestTime() {
        try {
            return parseFloat(localStorage[G.bestTimeKey]) || 0;
        } catch(e) {
            return 0;
        }
    }

    get bestTimeKey() {
        return location.pathname + G.difficulty.label;
    }

    mainMenu() {
        INTERPOLATIONS = [];

        // Go to the top of the tower
        interp(
            G,
            'bottomScreenAltitude',
            G.bottomScreenAltitude,
            MAX_LEVEL_ALTITUDE + LEVEL_HEIGHT - CANVAS_HEIGHT / 2 + 100,
            2,
            0.5,
            easeInOutCubic
        );

        // Show the windows so the tower can be rendered again
        interp(G, 'windowsAlpha', G.windowsAlpha, 1, 1, 1);
        interp(G, 'mainTitleAlpha', 0, 1, 1, 3);

        G.isStarted = false;
        G.timerActive = false;
        G.timer = 0;
    }

    endAnimation() {
        // Allow the player to start the game again
        G.isStarted = false;
        G.timerActive = false;

        // Only save the best time if the player didn't switch the difficulty during
        if (!G.wasDifficultyChangedDuringRun) {
            localStorage[G.bestTimeKey] = min(G.bestTime || 999999, G.timer);
        }

        G.mainMenu();

        // Replace the title
        G.mainTitle = nomangle('YOU BEAT');
        G.interTitle = '';

        const hardTrophy = G.difficulty == HARD_DIFFICULTY;
        const normalTrophy = G.difficulty == NORMAL_DIFFICULTY || hardTrophy;

        const keyPrefix = nomangle(`OS13kTrophy,GG,${document.title},Beat the game - `);
        const value = nomangle(`'DESTORY IT ALL'`);

        if (normalTrophy) {
            localStorage[keyPrefix + nomangle('normal')] = value;
        }

        if (hardTrophy) {
            localStorage[keyPrefix + nomangle('nightmare')] = value;
        }

        localStorage[keyPrefix + nomangle('any')] = value;
    }

    cycle(e) {
        if (G.timerActive) {
            G.timer += e;
        }
        G.clock += e;
        G.shakeTitleTime -= e;

        if (INPUT.jump()) {
            G.startAnimation();
        }

        G.level.cycle(e);
        INTERPOLATIONS.slice().forEach(i => i.cycle(e));
    }

    centerLevel(levelIndex, duration, delay, callback) {
        // Move the camera to the new level, and only then start it
        interp(
            G,
            'bottomScreenAltitude',
            G.bottomScreenAltitude,
            G.levelBottomAltitude(levelIndex) - TOWER_BASE_HEIGHT,
            duration,
            delay,
            easeInOutCubic,
            callback
        );
    }

    nextLevel() {
        // Stop the previous level
        G.level.stop();

        // Prepare the new one
        G.level = LEVELS[G.level.index + 1];
        G.level.prepare();

        // Move the camera to the new level, and only then start it
        G.centerLevel(G.level.index, 0.5, 0, () => G.level.start());

        nextLevelSound();
    }

    levelBottomAltitude(levelIndex) {
        return levelIndex * LEVEL_HEIGHT;
    }

    drawMatrixRain(ctx) {
        // Black BG for the canvas with translucent effect to show trails
        ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = "#f4427d"; 
        ctx.font = `${this.fontSize}px Arial`;

        for (let i = 0; i < this.drops.length; i++) {
            // Random character from matrix
            const text = this.matrix[Math.floor(Math.random() * this.matrix.length)];
            ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

            if (this.drops[i] * this.fontSize > CANVAS_HEIGHT && Math.random() > 0.975) {
                this.drops[i] = 0; // Reset to the top
            }
            this.drops[i]++;
        }
    }

    drawGrid(ctx) {
        const gridSize = 50; 
        const vanishingPointX = CANVAS_WIDTH / 2;
        const vanishingPointY = CANVAS_HEIGHT / 2;

        ctx.fillStyle = '#fff'; //background #333333
        ctx.fillRect(0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT/2);

        ctx.strokeStyle = '#00f';
        ctx.lineWidth = 1; 
    
        // Draw perspective lines from the bottom to the base of the buildings
        for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, CANVAS_HEIGHT); 
            ctx.lineTo(vanishingPointX, vanishingPointY); 
            ctx.stroke();
        }
    
        // Draw horizontal lines for the floor
        for (let y = vanishingPointY; y < CANVAS_HEIGHT; y += gridSize) {
            const leftX = vanishingPointX - ((vanishingPointY - y) * (vanishingPointX / vanishingPointY));
            const rightX = vanishingPointX + ((vanishingPointY - y) * (vanishingPointX / vanishingPointY));
    
            ctx.beginPath();
            ctx.moveTo(leftX, y); 
            ctx.lineTo(rightX, y); 
            ctx.stroke();
        }
    }
    
    render() {
        // Sky
        //fs(SKY_BACKGROUND);
        //fr(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // TODO maybe split into two?

        this.drawGrid(R);

        // Buildings in the background
        BUILDINGS_BACKGROUND.forEach((layer, i) => wrap (() => {
            const layerRatio = 0.2 + 0.8 * i / (BUILDINGS_BACKGROUND.length - 1);

            const altitudeRatio = G.bottomScreenAltitude / MAX_LEVEL_ALTITUDE;

            if (G.bottomScreenAltitude >= MAX_LEVEL_ALTITUDE) {
                fs(layer);
                translate(0, ~~(CANVAS_HEIGHT - layer.height + altitudeRatio * layerRatio * 400));
                fr(0, 0, CANVAS_WIDTH, layer.height);
            }
        }));

        this.drawMatrixRain(R);

        BUILDINGS_BACKGROUNDS.forEach((layer, i) => wrap (() => {
            const layerRatio = 0.2 + 0.8 * i / (BUILDINGS_BACKGROUNDS.length - 1);

            const altitudeRatio = G.bottomScreenAltitude / MAX_LEVEL_ALTITUDE;

            if (G.bottomScreenAltitude < buildingVisibilityThresholds[i]) {
                fs(layer);
                translate(0, ~~(CANVAS_HEIGHT - layer.height + altitudeRatio * layerRatio * 400));
                fr(0, 0, CANVAS_WIDTH, layer.height);
            }
        }));

        // Render the tower
        wrap(() => {
            translate(LEVEL_X, ~~G.bottomScreenAltitude + LEVEL_HEIGHT + TOWER_BASE_HEIGHT);

            // Render the rooftop (sign, lights)
            wrap(() => {
                translate(0, -MAX_LEVEL_ALTITUDE - LEVEL_HEIGHT);

                wrap(() => {
                    R.globalAlpha = 0.5;

                    // drawImage(
                    //     GOD_RAY,
                    //     0, 0,
                    //     GOD_RAY.width,
                    //     GOD_RAY.height / 2,
                    //     0,
                    //     -100,
                    //     LEVEL_WIDTH,
                    //     100
                    // );
                });

                // Sign holder
                // wrap(() => {
                //     translate(LEVEL_WIDTH / 2 - CELL_SIZE * 6, 0);
                //     fs(SIGN_HOLDER_PATTERN);
                //     fr(0, 0, CELL_SIZE * 12, -CELL_SIZE * 2);
                // });

                // Halo behind the sign
                // [
                //     30,
                //     90,
                //     150,
                //     210
                // ].forEach(x => wrap(() => {
                //     R.globalAlpha = (sin(G.clock * PI * 2 / 2) * 0.5 + 0.5) * 0.1 + 0.2;
                //     drawImage(RED_HALO, LEVEL_WIDTH / 2 + x - RED_HALO.width / 2, -200);
                //     drawImage(RED_HALO, LEVEL_WIDTH / 2 - x - RED_HALO.width / 2, -200);
                // }));

                // Sign
                R.textAlign = nomangle('center');
                R.textBaseline = nomangle('alphabetic');
                fs('#ffbb33');
                R.strokeStyle = '#f00';
                R.lineWidth = 5;
                R.font = italicFont(96);
                outlinedText(nomangle('CYBERSPACE'), LEVEL_WIDTH / 2, -30);
            });

            // Render the levels
            const currentLevelIndex = LEVELS.indexOf(G.level);
            for (let i = max(0, currentLevelIndex - 1) ; i < min(LEVELS.length, currentLevelIndex + 2) ; i++) {
                wrap(() => {
                    translate(0, -G.levelBottomAltitude(i) - LEVEL_HEIGHT);
                    LEVELS[i].render();
                });
            }

            // Render the windows in front
            // R.globalAlpha = G.windowsAlpha;
            // fs(BUILDING_PATTERN);
            // wrap(() => {
            //     // translate(-CELL_SIZE / 2, 0);
            //     fr(0, 0, LEVEL_WIDTH, -MAX_LEVEL_ALTITUDE - LEVEL_HEIGHT);
            // });

        });

        if (G.menu) {
            wrap(() => G.menu.render());
        }

        wrap(() => {

            // Instructions
            if (G.clock % 2 < 1.5 && G.mainTitleAlpha == 1) {
                const instructions = [
                    nomangle('PRESS [SPACE] TO START'),
                    DIFFICULTY_INSTRUCTION.toUpperCase(),
                ]
                instructions.forEach((s, i) => {
                    R.textAlign = nomangle('center');
                    R.textBaseline = nomangle('middle');
                    R.font = font(24);
                    fs('#fff');
                    R.strokeStyle = '#000';
                    R.lineWidth = 2;

                    outlinedText(s, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 4 / 5 + i * 50);
                });
            }
        });

        // Mobile controls
        fs('#000');
        fr(0, CANVAS_HEIGHT, CANVAS_WIDTH, MOBILE_CONTROLS_HEIGHT);

        fs('#fff');

       //Left Arrow
        wrap(() => {
            R.globalAlpha = 0.5 + 0.5 * !!down[KEYBOARD_LEFT];
            translate(CANVAS_WIDTH / 8, CANVAS_HEIGHT + MOBILE_CONTROLS_HEIGHT / 2);
            scale(-1, 1);
            renderMobileArrow();
        });

        //Right Arrow
        wrap(() => {
            R.globalAlpha = 0.5 + 0.5 * !!down[KEYBOARD_RIGHT];
            translate(CANVAS_WIDTH * 3 / 8, CANVAS_HEIGHT + MOBILE_CONTROLS_HEIGHT / 2);
            renderMobileArrow();
        });

        //Jump
        wrap(() => {
            R.globalAlpha = 0.5 + 0.5 * !!down[KEYBOARD_SPACE];
            fillCircle(
                evaluate(CANVAS_WIDTH * 2.5 / 4),
                evaluate(CANVAS_HEIGHT + MOBILE_CONTROLS_HEIGHT / 2),
                evaluate(MOBILE_BUTTON_SIZE / 2)
            );
        });

        // Button for 'E'
        wrap(() => {
            R.globalAlpha = 0.5 + 0.5 * !!down[KEYBOARD_E];
            fillCircle(
                evaluate(CANVAS_WIDTH * 3.8 / 4),
                evaluate(CANVAS_HEIGHT + MOBILE_CONTROLS_HEIGHT / 2),
                evaluate(MOBILE_BUTTON_SIZE / 2)
            );
            R.font = "bold 30px Arial"; // Example font settings
            R.fillStyle = "white"; // Text color
            R.textAlign = "center"; // Center the text
            R.textBaseline = "middle"; // Middle align the text
            R.fillText(
                "E",
                evaluate(CANVAS_WIDTH * 3.8 / 4),
                evaluate(CANVAS_HEIGHT + MOBILE_CONTROLS_HEIGHT / 2)
            );
        });

        // Button for 'G'
        wrap(() => {
            R.globalAlpha = 0.5 + 0.5 * !!down[KEYBOARD_G];
            fillCircle(
                evaluate(CANVAS_WIDTH * 3.3 / 4),
                evaluate(CANVAS_HEIGHT + MOBILE_CONTROLS_HEIGHT / 2),
                evaluate(MOBILE_BUTTON_SIZE / 2)
            );
            R.font = "bold 30px Arial"; // Example font settings
            R.fillStyle = "white"; // Text color
            R.textAlign = "center"; // Center the text
            R.textBaseline = "middle"; // Middle align the text
            R.fillText(
                "G",
                evaluate(CANVAS_WIDTH * 3.3 / 4),
                evaluate(CANVAS_HEIGHT + MOBILE_CONTROLS_HEIGHT / 2)
            );
        });


        // HUD
        const hudItems = [
            [nomangle('DIFFICULTY:'), G.difficulty.label]
        ];

        if (G.timer) {
            hudItems.push([
                nomangle('LEVEL:'),
                (G.level.index + 1) + '/' + LEVELS.length
            ]);
            hudItems.push([
                nomangle('TIME' ) + (G.wasDifficultyChangedDuringRun ? nomangle(' (INVALIDATED):') : ':'),
                formatTime(G.timer)
            ]);
        }

        hudItems.push([
            nomangle('BEST [') + G.difficulty.label + ']:',
            formatTime(G.bestTime)
        ]);


        hudItems.forEach(([label, value], i) => wrap(() => {

            R.textAlign = nomangle('left');
            R.textBaseline = nomangle('middle');
            fs('#fff');

            // Label
            R.font = italicFont(18);
            shadowedText(label, 20, 30 + i * 90);

            // Value
            R.font = font(36);
            shadowedText(value, 20, 30 + 40 + i * 90);
        }));

        // Gamepad info
        R.textAlign = nomangle('right');
        R.textBaseline = nomangle('alphabetic');
        R.font = nomangle('18pt Courier');
        fs('#888');
        fillText(
            nomangle('Gamepad: ') + (gamepads().length ? nomangle('yes') : nomangle('no')),
            evaluate(CANVAS_WIDTH - 20),
            evaluate(CANVAS_HEIGHT - 20)
        );

        // Intro background
        wrap(() => {
            R.globalAlpha = G.introAlpha;
            fs('#000');
            fr(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        });

        // Title
        wrap(() => {
            if (G.shakeTitleTime > 0) {
                translate(rnd(-10, 10), rnd(-10, 10));
            }

            R.globalAlpha = G.mainTitleAlpha;
            R.textAlign = nomangle('center');
            R.textBaseline = nomangle('middle');
            fs('#fff');
            R.strokeStyle = '#000';

            // Main title
            R.lineWidth = 5;
            R.font = TITLE_FONT;
            outlinedText(G.mainTitle, CANVAS_WIDTH / 2, TITLE_Y + G.mainTitleYOffset);

            // "Inter" title (between the title)
            R.font = INTER_TITLE_FONT;
            R.lineWidth = 2;
            outlinedText(G.interTitle, CANVAS_WIDTH / 2, INTER_TITLE_Y + G.interTitleYOffset);
        });

        G.renderables.forEach(renderable => wrap(() => renderable.render()));
    }

    particle(props) {
        let particle;
        props.onFinish = () => remove(G.renderables, particle);
        G.renderables.push(particle = new Particle(props));
    }

}
