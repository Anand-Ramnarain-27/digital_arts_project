const legLength = 6;
const visualRadius = PLAYER_RADIUS + 2;
const bodyWidth = visualRadius * 2 - 8;
const bodyHeight = visualRadius * 2 - 4;

const neonPlayerGlowColor = "#0ff"; // Neon cyan color for glow effect
const neonBodyColor = "#000";
const neonGlowColorGuard = "#ffa500"; // Neon orange for guard outline and glow

createCharacterBody = (instructions, glowColor) =>
  createCanvas(bodyWidth, bodyHeight + legLength, (c, can) => {
    // Apply neon glow effect
    c.shadowBlur = 20;
    c.shadowColor = glowColor;

    // Character body fill
    c.fillStyle = neonBodyColor;
    c.beginPath();
    c.roundedRectangle(0, 0, can.width, bodyHeight, 6);
    c.fill();

    c.globalCompositeOperation = nomangle("source-atop");

    instructions(c, can);

    // Draw glowing border
    c.lineWidth = 3;
    c.strokeStyle = glowColor;
    c.stroke();
  });

PLAYER_BODY = createCharacterBody((c, can) => {
  // Skin with neon border
  c.fillStyle = "#daab79";
  c.fillRect(can.width, 6, -bodyWidth / 2 - 4, 6);
  c.strokeStyle = neonPlayerGlowColor;
  c.strokeRect(can.width, 6, -bodyWidth / 2 - 4, 6);

  // Belt with neon glow
  c.fillStyle = "#400";
  c.fillRect(0, bodyHeight - 10, 99, 4);
  c.strokeRect(0, bodyHeight - 10, 99, 4);
}, neonPlayerGlowColor);

GUARD_BODY = createCharacterBody((c, can) => {
  // Skin with neon border
  c.fillStyle = "#daab79";
  c.fillRect(can.width, 6, -bodyWidth / 2 - 4, 6);
  c.strokeStyle = neonGlowColorGuard;
  c.strokeRect(can.width, 6, -bodyWidth / 2 - 4, 6);

  // Helmet
  c.fillStyle = "#333"; // Dark gray for helmet
  c.fillRect(can.width / 2 - 12, 0, 24, 10); // Top of the helmet
  c.strokeRect(can.width / 2 - 12, 0, 24, 10);

  // Glowing visor
  c.fillStyle = neonGlowColorGuard;
  c.shadowBlur = 10;
  c.shadowColor = neonGlowColorGuard;
  c.fillRect(can.width / 2 - 10, 3, 20, 4);
}, neonGlowColorGuard);

renderCharacter = (
  context,
  clock,
  body,
  legs,
  facing,
  walking,
  jumpRatio,
  isGuard // Pass this as true for the guard, false for the player
) => {
  context.scale(facing, 1);

  wrap(() => {
    // Bobbing effect for walking
    if (walking) {
      context.rotate((sin((clock * PI * 2) / 0.25) * PI) / 32);
    }

    // Flip animation for jumping
    context.rotate(jumpRatio * PI * 2);

    context.translate(-body.width / 2, -body.height / 2);

    // Render the body
    context.drawImage(body, 0, 0);

    // Conditionally render helmet and eyes
    if (isGuard) {
      // Guard-specific rendering logic (with helmet)
      //renderEyes(context, clock, true); // Pass 'true' to indicate guard's eyes
      renderHelmet(context); // Render helmet for guard
    } else {
      // Player-specific rendering logic (without helmet)
      renderEyes(context, clock); // Pass 'false' for player's eyes
    }
  });

  // Render legs
  if (legs) {
    renderLegs(context, clock, walking);
  }
};

renderEyes = (context, clock) => {
  context.fs("#000");

  const moduloTime = clock % BLINK_INTERVAL;
  const middleBlinkTime = evaluate(BLINK_INTERVAL - BLINK_TIME / 2);
  const eyeScale = min(
    1,
    max(-moduloTime + middleBlinkTime, moduloTime - middleBlinkTime) /
      (BLINK_TIME / 2)
  );

  context.fr(bodyWidth - 1, 7, -4, 4 * eyeScale);
  context.fr(bodyWidth - 8, 7, -4, 4 * eyeScale);
};

renderLegs = (context, clock, walking) => {
  context.fs("#000");

  const legLengthRatio = sin((clock * PI * 2) / 0.25) * 0.5 + 0.5;
  const leftRatio = walking ? legLengthRatio : 1;
  const rightRatio = walking ? 1 - legLengthRatio : 1;
  context.fr(-8, visualRadius - legLength, 4, leftRatio * legLength);
  context.fr(8, visualRadius - legLength, -4, rightRatio * legLength);
};

renderHelmet = (context) => {
    // Draw helmet for guard
    context.fillStyle = '#333';  // Dark gray for the helmet
    context.fillRect(bodyWidth / 2 - 12, 0, 24, 10);  // Helmet rectangle
    context.strokeRect(bodyWidth / 2 - 12, 0, 24, 10);

    // Draw glowing visor
    context.fillStyle = neonGlowColorGuard;
    context.shadowBlur = 10;
    context.shadowColor = neonGlowColorGuard;
    context.fillRect(bodyWidth / 2 - 10, 3, 20, 4);  // Visor
};

renderBandana = (context, characterPosition, bandanaTrail) => {
  R.lineWidth = 8;
  R.strokeStyle = "#000";
  R.lineJoin = "round";
  beginPath();
  moveTo(characterPosition.x, characterPosition.y);

  let remainingLength = MAX_BANDANA_LENGTH;

  for (let i = 0; i < bandanaTrail.length && remainingLength > 0; i++) {
    const current = bandanaTrail[i];
    const previous = bandanaTrail[i - 1] || characterPosition;

    const actualDistance = dist(current, previous);
    const renderedDist = min(actualDistance, remainingLength);
    remainingLength -= renderedDist;
    const ratio = renderedDist / actualDistance;

    lineTo(
      previous.x + ratio * (current.x - previous.x),
      previous.y + ratio * (current.y - previous.y)
    );
  }
  stroke();
};
