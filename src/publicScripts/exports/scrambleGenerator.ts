// each step has letter and direction
const SIDES: string[] = [
    // default sides
    "R", "L", "U", "D", "F", "B",
    // Well, maybe some day I'll day more modes like 4x4 & 5x5
    // "Rw", "Lw", "Uw", "Dw", "Fw", "Bw"
];
// direction can be clockwise, counterclockwise or twice
const DIRECTIONS: string[] = [
    "'", "", "2"
]

export function generateScramble(scrambleLen: number): string {
    let scramble: string = "";
    for (let i = 1; i <= scrambleLen; i++) {
        // random side and direction for move
        const letter = SIDES[Math.floor(Math.random() * SIDES.length)];
        const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

        // checking if the last scramble letter was the same as current
        if(scramble.replace(/[\'2]/g, "").trim().endsWith(letter)) {
            i--;
            continue;
        }


        scramble += `${letter}${direction} `;
    }
    return scramble.trim();
}

