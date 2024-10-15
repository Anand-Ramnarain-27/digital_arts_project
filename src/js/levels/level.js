class Level {
    constructor(index, definition) {
      this.index = index;
      this.definition = definition;
  
      this.deathCount = 0;

      this.glitchInterval = 60000; // 30 seconds
      this.glitchTimer = null;
  
      this.backgroundColor = LEVEL_COLORS[index % LEVEL_COLORS.length];
      this.obstacleColor = darken(this.backgroundColor, 0.2);
  
      this.stop();
      this.startGlitchEffect(); // Start the glitch effect
    }

    startGlitchEffect() {
        this.glitchTimer = setInterval(() => {
            this.triggerGlitch();
        }, this.glitchInterval);
    }

    triggerGlitch() {
        // Call the method to apply the glitch effect
        this.applyGlitchEffect();
    }

    applyGlitchEffect() {
        // Randomly select a teleport location
        const randomPosition = this.getRandomPosition();
        this.player.moveTo(randomPosition.x, randomPosition.y);

        // Optionally, you can add a visual effect here
        this.showGlitchEffect();
    }

    getRandomPosition() {
        // Define the bounds of the level
        const xLimit = LEVEL_COLS * CELL_SIZE;
        const yLimit = LEVEL_ROWS * CELL_SIZE;

        // Generate random coordinates within the level bounds
        const randomX = Math.floor(Math.random() * (xLimit / CELL_SIZE)) * CELL_SIZE;
        const randomY = Math.floor(Math.random() * (yLimit / CELL_SIZE)) * CELL_SIZE;

        return { x: randomX, y: randomY };
    }

    showGlitchEffect() {
    // Example: briefly change the screen color
    R.fillStyle = "rgba(255, 0, 0, 0.5)"; // Red tint for glitch
    R.fillRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT); // Cover the entire canvas

    // Reset color after a short duration (you can use a timeout)
    setTimeout(() => {
        R.clearRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    }, 100); // Clear after 100ms
}

  
    endWith(f) {
      if (!this.ended) {
        this.ended = true;
        f();
      }
    }
  
    foundExit() {
      this.endWith(() => {
        exitSound();
  
        const hasNextLevel = LEVELS[this.index + 1];
        G.menu = new Menu(
          pick([
            nomangle("BREACHING SECURITY..."),
            nomangle("DISABLING FIREWALL..."),
            nomangle("INITIATING HACK..."),
            nomangle("ACCESSING SYSTEM FILES..."),
          ]),
          hasNextLevel
            ? pick([
                nomangle("CRITICAL FILES MISSING..."),
                nomangle("SYSTEM COMPROMISED..."),
                nomangle("SYSTEM EXPOSED..."),
                nomangle("PARTIAL BREACH SUCCESSFUL..."),
              ])
            : nomangle("SECURITY BREACH: SYSTEM DESTROYED!")
        );
        G.menu.animateIn();
  
        setTimeout(() => {
          (hasNextLevel ? notFoundSound : finishSound)();
        }, 1000);
  
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
        this.deathCount++;
  
        G.menu = new Menu(
          nomangle("BREACH DETECTED: CONNECTION TERMINATED!"),
          nomangle("PRESS [R] TO TRY AGAIN"),
          DIFFICULTY_INSTRUCTION.toUpperCase()
        );
        G.menu.animateIn();
  
        failSound();
  
        setTimeout(() => {
          if (this.ended) {
            this.waitingForRetry = true;
          }
        }, 1000);
      });
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
  
      this.definition.cameras.forEach((cameraDefinition) => {
        const camera = new Camera(this, cameraDefinition);
        this.cyclables.push(camera);
        this.renderables.push(camera);
      });
  
      this.definition.guards.forEach((guardDefinition) => {
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
      clearInterval(this.glitchTimer);
      this.cyclables = [];
      this.renderables = [];
    }
  
    cycle(e) {
      e *= G.difficulty.timeFactor;
  
      if (this.started && !this.ended) {
        this.clock += e;
        this.cyclables.forEach((x) => x.cycle(e));
      }
  
      if (
        (INPUT.jump() && this.waitingForRetry) ||
        (down[KEYBOARD_R] && this.started)
      ) {
        this.waitingForRetry = false;
        if (G.menu) {
          G.menu.animateOut();
  
          if (
            !G.difficultyPromptShown &&
            this.deathCount > DIFFICULTY_PROMPT_DEATH_COUNT
          ) {
            G.difficultyPromptShown = true;
            alert(DIFFICULTY_INSTRUCTION);
          }
        }
        this.prepare();
  
        setTimeout(() => this.start(), 1000);
  
        beepSound();
      }
    }
  
    render() {
      this.background = this.background || createLevelBackground(this);
      drawImage(this.background, 0, 0);
  
      if (DEBUG && getDebugValue("grid")) {
        R.fs("rgba(0,0,0,0.2)");
        for (let k = 0; k < LEVEL_ROWS; k++) {
          fr(0, k * CELL_SIZE, LEVEL_COLS * CELL_SIZE, 1);
          fr(k * CELL_SIZE, 0, 1, LEVEL_ROWS * CELL_SIZE);
        }
  
        R.fs("#fff");
        R.textAlign = "center";
        R.textBaseline = "middle";
        R.font = "6pt Arial";
        for (let row = 0; row < LEVEL_ROWS; row++) {
          for (let col = 0; col < LEVEL_ROWS; col++) {
            fillText(
              `${row}-${col}`,
              toMiddleCellCoord(col),
              toMiddleCellCoord(row)
            );
          }
        }
      }
  
      // Message
      wrap(() => {
        const ratio = limit(0, (this.clock - LEVEL_MESSAGE_DELAY) * 3, 1);
        R.globalAlpha = ratio;
        translate(0, (1 - ratio) * -10);
  
        const [row, message] = this.definition.message || [0, ""];
        R.textAlign = "center";
        R.textBaseline = "middle";
        R.fs("rgba(255,255,255,0.7)");
        R.shadowColor = '#00ffcc'; // Neon cyan shadow (glow effect)
        R.shadowBlur = 5; // Soft glow around the text
        R.font = font(26);
        fillText(message, LEVEL_WIDTH / 2, toMiddleCellCoord(row));
      });
  
      // Renderables
      this.renderables.forEach((x) => wrap(() => x.render()));
  
      // Matrix (Rendering Black Tiles with Neon Borders)
      for (let row = 0; row < LEVEL_ROWS; row++) {
        for (let col = 0; col < LEVEL_ROWS; col++) {
          if (this.definition.matrix[row][col]) {
            // Black tile fill
            R.fs("#000"); // Black background for each tile
            fr(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  
           // Set up the glow effect for the border
           R.shadowBlur = 20; // The amount of glow (higher values = more glow)
           R.shadowColor = this.backgroundColor; // Neon glow color based on the level
           R.lineWidth = 2; // Border thickness
  
           // Neon border around the tiles
           R.strokeStyle = this.backgroundColor; // Neon border color
           R.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  
           // Reset the shadow settings after drawing the border to avoid affecting other elements
           R.shadowBlur = 0;
           R.shadowColor = 'transparent';
          }
        }
      }
    }
  
    particle(properties) {
      let particle;
      properties.onFinish = () => remove(this.renderables, particle);
      this.renderables.push((particle = new Particle(properties)));
    }
  }
  