class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.previous = {};

        this.vX = this.vY = 0;

        this.jumpHoldTime = 0;
        this.jumpReleased = true;
        this.jumpStartY = 0;
        this.jumpEndY = 0;
        this.jumpPeakTime = 0;
        this.wallJump = 0;

        this.wasStickingToWallX = 0;

        this.clock = 0;
    }

    get landed() {
        const leftX = this.x - PLAYER_RADIUS;
        const rightX = this.x + PLAYER_RADIUS;
        const bottomY = this.y + PLAYER_RADIUS + 1;

        return hasBlock(leftX, bottomY) || hasBlock(rightX, bottomY);
    }

    get sticksToWall() {
        if (this.landed) {
            return 0;
        }

        const keepSticking = this.wasStickingToWallX == this.x;

        const leftX = this.x - PLAYER_RADIUS - 1;
        const rightX = this.x + PLAYER_RADIUS + 1;

        if (hasBlock(leftX, this.y) && (w.down[KEYBOARD_LEFT] || this.wasStickingToWallX)) {
            this.wasStickingToWallX = this.x;
            return 1;
        }

        if (hasBlock(rightX, this.y) && (w.down[KEYBOARD_RIGHT] || this.wasStickingToWallX)) {
            this.wasStickingToWallX = this.x;
            return -1;
        }

        return 0;
    }

    cycle(e) {
        // Save the previous state
        this.previous.x = this.x;
        this.previous.y = this.y;
        this.previous.clock = this.clock;
        this.previous.landed = this.landed;
        this.previous.jumpHoldTime = this.jumpHoldTime;

        this.clock += e;

        const holdingJump = down[KEYBOARD_SPACE];
        this.jumpReleased = this.jumpReleased || !down[KEYBOARD_SPACE];

        if (holdingJump) {
            this.jumpHoldTime += e;
        } else {
            this.jumpHoldTime = 0;
        }

        const newJump = holdingJump && this.jumpReleased && (this.landed || this.sticksToWall);
        if (newJump) {
            this.jumpReleased = false;
            this.jumpStartY = this.y;
            this.jumpStartTime = this.clock;
            this.wallJump = this.sticksToWall;

            this.vX += this.wallJump * 800;
        }

        if (holdingJump && !this.jumpReleased) {
            const jumpHoldRatio = min(this.jumpHoldTime, MAX_JUMP_HOLD_TIME) / MAX_JUMP_HOLD_TIME;
            const height = CELL_SIZE / 2 + jumpHoldRatio * CELL_SIZE * 3;

            this.jumpPeakTime = 0.1 + 0.2 * jumpHoldRatio;
            this.jumpEndY = this.jumpStartY - height;
        }

        if (this.clock < this.jumpStartTime + this.jumpPeakTime) {
            // Rise up
            const jumpRatio = (this.clock - this.jumpStartTime) / this.jumpPeakTime;
            this.y = easeOutQuad(jumpRatio) * (this.jumpEndY - this.jumpStartY) + this.jumpStartY;
        } else {
            // Fall down
            const gravity = this.sticksToWall && this.vY > 0 ? 1000 : GRAVITY_ACCELERATION;
            this.vY = max(0, this.vY + gravity * e);
            this.y += this.vY * e;
        }

        // Left/right
        let dX = 0, targetVX = 0;
        if (down[KEYBOARD_LEFT]) {
            dX = -1;
            targetVX = -PLAYER_HORIZONTAL_SPEED;
        }
        if (down[KEYBOARD_RIGHT]) {
            dX = 1;
            targetVX = PLAYER_HORIZONTAL_SPEED;
        }

        const horizontalAcceleration = this.landed ? PLAYER_HORIZONTAL_FLOOR_ACCELERATION : PLAYER_HORIZONTAL_FLIGHT_ACCELERATION;
        this.vX += limit(
            -horizontalAcceleration * e,
            targetVX - this.vX,
            horizontalAcceleration * e
        );
        this.x += this.vX * e;

        this.readjust();
    }

    goToClosestAdjustment(reference, adjustments) {
        let closestAdjustment,
            closestAdjustmentDistance = 999;
        for (let i = 0 ; i < adjustments.length ; i++) {
            const distance = dist(reference, adjustments[i]);
            if (distance < closestAdjustmentDistance) {
                closestAdjustment = adjustments[i];
                closestAdjustmentDistance = distance;
            }
        }

        if (closestAdjustment) {
            this.x = closestAdjustment.x;
            this.y = closestAdjustment.y;
        }

        return closestAdjustment;
    }

    toCellUnit(x) {
        return ~~(x / CELL_SIZE);
    }

    allSnapAdjustments() {
        const leftX = this.x - PLAYER_RADIUS;
        const rightX = this.x + PLAYER_RADIUS;
        const topY = this.y - PLAYER_RADIUS;
        const bottomY = this.y + PLAYER_RADIUS;

        const leftCol = this.toCellUnit(leftX);
        const rightCol = this.toCellUnit(rightX);
        const topRow = this.toCellUnit(topY);
        const bottomRow = this.toCellUnit(bottomY);

        const topLeft = hasBlock(leftX, topY);
        const topRight = hasBlock(rightX, topY);
        const bottomLeft = hasBlock(leftX, bottomY);
        const bottomRight = hasBlock(rightX, bottomY);

        const snapX = [this.previous.x, this.x];
        const snapY = [this.previous.y, this.y];
        for (let col = leftCol ; col <= rightCol ; col++) {
            snapX.push(
                col * CELL_SIZE + PLAYER_RADIUS,
                (col + 1) * CELL_SIZE - PLAYER_RADIUS - 0.0001
            );
        }
        for (let row = topRow ; row <= bottomRow ; row++) {
            snapY.push(
                row * CELL_SIZE + PLAYER_RADIUS,
                (row + 1) * CELL_SIZE - PLAYER_RADIUS - 0.0001
            );
        }

        return snapX.flatMap((x) => {
            return snapY.map((y) => {
                return {
                    'x': x,
                    'y': y
                };
            });
        }).filter((adjustment) => {
            return !hasBlock(
                adjustment.x,
                adjustment.y,
                PLAYER_RADIUS
            );
        });
    }

    readjust() {
        const { x, y } = this;

        const allAdjustments = this.allSnapAdjustments();
        const adjustment = this.goToClosestAdjustment(this, allAdjustments);

        if (this.landed) {
            // Landed, reset the jump
            this.vY = min(0, this.vY);

            if (!this.previous.landed) {
                console.log('LAND!')
                this.jumpStartTime = -1;
            }
        } else if (this.y > y) {
            console.log('OUCH!');

            // Tapped its head, cancel all jump
            this.vY = max(0, this.vY);
            this.jumpStartTime = -1;
        }

        if (this.x != x) {
            // Player hit an obstacle, reset horizontal momentum
            this.vX = 0;
        }

    }

    render() {
        wrap(() => {
            translate(this.x, this.y);

            R.fillStyle = '#f00';
            fr(
                -PLAYER_RADIUS,
                -PLAYER_RADIUS,
                PLAYER_RADIUS * 2,
                PLAYER_RADIUS * 2
            );
        });

        const angles = [];

        R.strokeStyle = '#f00';
        R.fillStyle = '#f00';
        R.globalAlpha = 0.2;
        R.lineWidth = 5;

        beginPath();
        for (let angle = 0 ; angle < PI * 2 ; angle += PI / 16) {
            const impact = castRay(this.x, this.y, angle, 400);
            // beginPath();
            // moveTo(this.x, this.y);
            lineTo(impact.x, impact.y);
            // stroke();
        }

        // fill();

        // const allAdjustments = this.allSnapAdjustments();
        // allAdjustments.forEach((adjustment) => {
        //     R.strokeStyle = 'blue';
        //     strokeRect(adjustment.x - PLAYER_RADIUS, adjustment.y - PLAYER_RADIUS, PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);
        // });
    }
}