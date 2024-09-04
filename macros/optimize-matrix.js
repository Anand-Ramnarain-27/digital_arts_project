'use strict';

const {LEVEL_COLS, LEVEL_ROWS} = require('../config/constants.json');

module.exports = {
    'apply': (input) => {
        const matrix = JSON.parse(input);
        const lines = [];

        const rows = matrix.length;
        const cols = matrix[0].length;

        for (let row = 1 ; row < rows - 1 ; row++) {
            for (let col = 1 ; col < cols - 1 ; col++) {
                if (!matrix[row][col]) {
                    continue;
                }

                let verticalLength = 0;
                while (row + verticalLength < rows - 1 && matrix[row + verticalLength][col]) {
                    verticalLength++;
                }

                let horizontalLength = 0;
                while (col + horizontalLength < cols - 1 && matrix[row][col + horizontalLength]) {
                    horizontalLength++;
                }

                // If we're on the first column or the last one, it means we're on one of the bounds,
                // which we always assume are there so we don't need them.
                // if (col === 0 || col === cols - 1) {
                //     continue;
                // }

                if (verticalLength >= horizontalLength) {
                    for (let i = 0 ; i < verticalLength ; i++) {
                        matrix[row + i][col] = 0;
                    }
                    lines.push([row, col, verticalLength, 0]);
                } else {
                    for (let i = 0 ; i < horizontalLength ; i++) {
                        matrix[row][col + i] = 0;
                    }
                    lines.push([row, col, 0, horizontalLength]);
                }
            }
        }

        return `${rows}, ${cols}, ${JSON.stringify(lines)}`;
    },
    'revert': function(rows, cols, lines) {
        const result = [];
        const topAndBottomRow = Array(cols).fill(1);
        result.push(topAndBottomRow);
        for (let i = 0 ; i < rows - 2 ; i++) {
            const row = [];
            row.length = cols;
            row[0] = 1;
            row[cols - 1] = 1;
            result.push(row);
        }
        result.push(topAndBottomRow);

        lines.forEach((line) => {
            let [
                row,
                col,
                verticalLength,
                horizontalLength
            ] = line;

            let verticalIncr = !!verticalLength;
            let horizontalIncr = !!horizontalLength;

            for (let i = 0 ; i < max(verticalLength, horizontalLength) ; i++) {
                result[row + i * verticalIncr][col + i * horizontalIncr] = 1;
            }
        });

        return result;
    }
};