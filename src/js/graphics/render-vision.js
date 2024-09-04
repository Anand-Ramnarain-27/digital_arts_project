renderVision = (x, y, fromAngle, toAngle, maxDistance, color) => wrap(() => {
    R.fillStyle = R.strokeStyle = color;
    R.lineWidth = 2;
    R.globalAlpha = 0.3;

    beginPath();
    moveTo(x, y);

    const subAngles = 30;
    for (let i = 0 ; i <= subAngles ; i++) {
        let angle = (i / subAngles) * (toAngle - fromAngle) + fromAngle;

        // For all angles in between, round them so that it looks a bit better when the vision is
        // interpolated.
        if (i && i < subAngles) {
            angle = roundToNearest(angle, (toAngle - fromAngle) / subAngles);
        }

        const impact = castRay(x, y, angle, maxDistance);
        lineTo(impact.x, impact.y);
    }

    closePath();
    fill();
    stroke();
});