//level.js
class Level {
  constructor(index, definition) {
    this.index = index;
    this.definition = definition;

    this.deathCount = 0;

    this.glitchInterval = 30000;
    this.glitchPlayerInterval = 20000;
    this.glitchTimer = null;

    this.backgroundColor = LEVEL_COLORS[index % LEVEL_COLORS.length];
    this.obstacleColor = darken(this.backgroundColor, 0.2);

    this.cam = this.definition.cameras.map(camera => camera);
    this.guardz = definition.guards.map(guard => guard);

    this.stop();
    //this.startGlitchEffect(); // Start the glitch effect
  }

  activatesEMP() {
    this.cam.forEach(camera => {
        if (camera instanceof Camera) { 
            camera.activatedEMP(); 
        }
    });
    this.guardz.forEach(guard =>{
      if(guard instanceof Guard){
        guard.activatedEMP();
      }
    });
  } 

  deactivatesEMP() {
    this.cam.forEach(camera => {
      if (camera instanceof Camera) {
          camera.deactivatedEMP(); 
      }
  });
  this.guardz.forEach(guard =>{
    if(guard instanceof Guard){
      guard.deactivatedEMP();
    }
  });
  }

  startGlitchEffect() {
    if (this.started)
      this.glitchTimer = setInterval(() => {
        this.triggerGlitch();
      }, this.glitchInterval);
  }

  startPlayerGiltchEffect(){
    if (this.started)
      this.glitchTimer = setInterval(() => {
        this.triggerPlayerGlitchEffect();
      }, this.glitchPlayerInterval);
  }

  triggerPlayerGlitchEffect() {
    this.applyPlayerGlitchEffect();
  }

  applyPlayerGlitchEffect() {
    this.player.showGlitchEffect();

    setTimeout(() => {
      this.player.removeGlitchEffect();
    }, 10000);
  }

  triggerGlitch() {
    this.applyGlitchEffect();
  }

  applyGlitchEffect() {
    // Randomly select a teleport location
    const randomPosition = this.getRandomPosition();
    this.player.moveTo(randomPosition.x, randomPosition.y);

    this.showGlitchEffect();
  }

  getRandomPosition() {
    const validPositions = [];
    // Collect all valid positions (cells with value 0)
    for (let row = 0; row < LEVEL_ROWS; row++) {
      for (let col = 0; col < LEVEL_COLS; col++) {
          if (this.definition.matrix[row][col] === 0) {
              validPositions.push({ x: col * CELL_SIZE, y: row * CELL_SIZE });
          }
      }
  }

  // Select a random position from the valid positions
  if (validPositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * validPositions.length);
      return validPositions[randomIndex];
  }

  // Fallback to a default position if no valid positions are found
  return { x: 0, y: 0 }; // Or any other default position you prefer
  }

  showGlitchEffect() {
    R.fillStyle = "rgba(255, 0, 0, 0.5)";
    R.fillRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

    setTimeout(() => {
      R.clearRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    }, 500);
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
      this.cam.push(camera);
    });

    this.definition.guards.forEach((guardDefinition) => {
      const guard = new Guard(this, guardDefinition);
      this.cyclables.push(guard);
      this.renderables.push(guard);
      this.guardz.push(guard);
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
    this.startGlitchEffect();
    this.startPlayerGiltchEffect();
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
      R.shadowColor = "#00ffcc";
      R.shadowBlur = 5;
      R.font = font(26);
      fillText(message, LEVEL_WIDTH / 2, toMiddleCellCoord(row));
    });

    this.renderables.forEach((x) => wrap(() => x.render()));

    // Matrix (Rendering Black Tiles with Neon Borders)
    for (let row = 0; row < LEVEL_ROWS; row++) {
      for (let col = 0; col < LEVEL_ROWS; col++) {
        if (this.definition.matrix[row][col]) {
          R.fs("#000"); 
          fr(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

          R.shadowBlur = 20; 
          R.shadowColor = this.backgroundColor; 
          R.lineWidth = 2; 

          R.strokeStyle = this.backgroundColor;
          R.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

          R.shadowBlur = 0;
          R.shadowColor = "transparent";
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
