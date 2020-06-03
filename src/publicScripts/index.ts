import { ipcRenderer } from 'electron';

import {generateScramble} from "./exports/scrambleGenerator.js";
import {startTimer, stopTimer} from "./exports/timer/timer";

// interactive elements
const scrambleField = document.querySelector("#scrambleField");
const timerField = document.querySelector("#timerField");
const attemptsCount = document.querySelector("#attemptsCount");
const attemptsField = document.querySelector("#attemptsField");
const resultsTitle = document.querySelector("#resultsTitle");
const resetSessionButton = document.querySelector("#resetSession");

// RESULTS
const avg5Field = document.querySelector("#avgFive");
const avg12Field = document.querySelector("#avgTwelve");
const avg50Field = document.querySelector("#avgFifty");
const avg100Field = document.querySelector("#avgHundred");


// array of attempts
let attempts: object[] = [];


// APP VARIABLES
export let isTimerOn: boolean = false;
let bestMode = false;
const DISCPLINES = {
    three: "3x3"
}
let currentDiscipline = DISCPLINES.three;

// interfaces
interface BestAndWorst {
    bestResult: number, worstResult: number
}
interface UpdateData {
    discipline: string,
    attempts: object[]
}

// DATA MANAGE FUNCTIONS
// function for restoring data from app storage
function restoreApp(): void {
    ipcRenderer.send("storage:get", currentDiscipline);

    updateScramble();
}
function resetSession() {
    attempts = [];
    updateStorage();
    updateAvgs();
    updateAttemptsField();
}


function showAttemptInfo(time: number, scramble: string): void {
    let attemptRole: string = 'none';

    const { bestResult, worstResult } = findBestAndWorst(attempts);
    if (time == bestResult) attemptRole = "best";
    else if (time == worstResult) attemptRole = "worst";

    // sending request to the main process to show new window with data
    ipcRenderer.send("window:show-info", {time, scramble, role: attemptRole});
}

function updateStorage() {
    const update: UpdateData = {
        discipline: currentDiscipline,
        attempts
    }
    ipcRenderer.send("storage:update", update);
}

// APP FUNCTIONALITY FUNCTIONS
function updateScramble() {
    // @ts-ignore
    scrambleField.textContent = generateScramble(21);
}

function addNewTime({value}: { value: any }): void {

    // @ts-ignore
    attempts[attempts.length - 1]["time"] = parseFloat(value);
    updateAttemptsField();
    // results field
    updateAvgs();
    updateStorage();
}



function updateAttemptsField(): void {

    // @ts-ignore
    attemptsCount.textContent = attempts.length + " attempts";

    // removing previous state to update it
    // @ts-ignore
    attemptsField.innerHTML = "";

    // getting best and worst attempt from attempts array
    const { bestResult, worstResult } = findBestAndWorst(attempts);

    // update attempts list
    for (let attempt of attempts) {
        // @ts-ignore
        // check if there's no already best tag attempt
        if (attempt.time) {
            // @ts-ignore
            if (attempt.time === bestResult && !document.querySelector(".attempt.is-success")) {
                // @ts-ignore
                addAttempt(attempt.time,attempt.scramble,"best");
            }
            // @ts-ignore
            else if (attempt.time === worstResult && !document.querySelector(".attempt.is-danger")) {
                // @ts-ignore
                addAttempt(attempt.time, attempt.scramble,"worst");
            }
            else {
                // @ts-ignore
                addAttempt(attempt.time, attempt.scramble, "normal");
            }
        }
        }
    // @ts-ignore
    attemptsField.scrollBy(0, 100);
}

// adds new child to attempts field
function addAttempt(time: number, scramble: string, role: string): void {
    let attempt;
    switch (role) {
        case "best":
            attempt = `<span data-scramble="${scramble}" class="attempt tag is-success is-medium">${time.toFixed(2)}</span>`;
            // @ts-ignore
            attemptsField.insertAdjacentHTML('beforeend', attempt);
            break;
        case "worst":
            attempt = `<span data-scramble="${scramble}" class="attempt tag is-danger is-medium">${time.toFixed(2)}</span>`;
            // @ts-ignore
            attemptsField.insertAdjacentHTML('beforeend', attempt);
            break;
        case "normal":
            attempt = `<span data-scramble="${scramble}" class="attempt tag is-light is-medium">${time.toFixed(2)}</span>`;
            // @ts-ignore
            attemptsField.insertAdjacentHTML('beforeend', attempt);
            break;
    }
}


function updateAvgs() {
    if (attempts.length >=  5) {
        // @ts-ignore
        avg5Field.textContent = findAverage(5, bestMode);

    } else {
        return restoreValues();
    }
    if (attempts.length >=  12) {
        // @ts-ignore
        avg12Field.textContent = findAverage(12, bestMode);
    }
    if (attempts.length >=  50) {
        // @ts-ignore
        avg50Field.textContent = findAverage(50, bestMode);

    }
    if (attempts.length >=  100) {
        // @ts-ignore
        avg100Field.textContent = findAverage(100, bestMode);

    }
}

function restoreValues() {
    const restoreValue:string = "0.00";
    // @ts-ignore
    avg5Field.textContent = avg12Field.textContent = avg50Field.textContent =  avg100Field.textContent = restoreValue;
}


// finds average of <averageOf> in attempts array, basically takes last <averageOf> attempts of array, removes best and
// worst attempt, calculates mean with rest of the attempts
function findAverage(averageOf: number, findBest: boolean): string {

    if (!findBest) {
        let lastNumbers = attempts.slice(attempts.length - averageOf);
        const { bestResult, worstResult } = findBestAndWorst(lastNumbers);
        // filtering best and worst to calculate avg
        lastNumbers = lastNumbers.filter((item) => {
            // @ts-ignore
            return item.time !== bestResult && item.time !== worstResult;
        })
        let sumOfAttempts: number = 0;
        for (let attempt of lastNumbers) {
            // @ts-ignore
            sumOfAttempts += Number(attempt.time.toFixed(2));
        }
        return (sumOfAttempts / (averageOf - 2)).toFixed(2);
    } else {
        let bestAvg: number = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < attempts.length; i++) {
            let lastNumbers = attempts.slice(i, i + averageOf);

            if (lastNumbers.length !== averageOf) break;
            const { bestResult, worstResult } = findBestAndWorst(lastNumbers);
            // filtering best and worst to calculate avg
            lastNumbers = lastNumbers.filter((item) => {
                // @ts-ignore
                return item.time !== bestResult && item.time !== worstResult;
            })
            let sumOfCurrent: number = 0;
            for (let attempt of lastNumbers) {
                // @ts-ignore
                sumOfCurrent += Number(attempt.time.toFixed(2));
            }
            if (sumOfCurrent / (averageOf -  2) < bestAvg) bestAvg = Number((sumOfCurrent / (averageOf - 2)).toFixed(2));
        }
        return bestAvg.toFixed(2)
    }
}

function findBestAndWorst(attempts: object[]): BestAndWorst {

    let bestResult: number = Number.MAX_SAFE_INTEGER;
    let worstResult: number = 0;

    // find best and worst results
    for (let attempt of attempts ) {
        // @ts-ignore
        if (attempt.time < bestResult) bestResult = attempt.time;
        // @ts-ignore
        if (attempt.time > worstResult) worstResult = attempt.time;
    }
    return { bestResult, worstResult };
}

// run this func every start of app
restoreApp();



// if user clicked on some attempt, we need to show it
// @ts-ignore
attemptsField.addEventListener("click", (e)=> {
    // @ts-ignore
    const attemptScramble = e.target.getAttribute("data-scramble");
    // prevent errors with clicking on parent div
    if (attemptScramble) {
        // @ts-ignore
        const attemptTime = parseFloat(e.target.textContent);

        showAttemptInfo(attemptTime, attemptScramble);
    }

})



document.body.onkeyup = async (e) => {
    // check if it is space has been pressed and timer is not working now
    if (e.key == " " && !isTimerOn) {
        e.preventDefault();

        // @ts-ignore
        timerField.classList.remove("ready");

        isTimerOn = true;
        // @ts-ignore
        let duringScramble = scrambleField.textContent;

        // preparing new attempt, now just adding scramble, when the attempt is finished there will be time
        attempts.push({
            scramble: duringScramble,
            time: undefined
        })
        // starting time function
        startTimer({ timerField });

    } else if (e.key && isTimerOn) { // if any key has been pressed and timer was on - stop the timer
        isTimerOn = false;
        // @ts-ignore
        scrambleField.textContent = generateScramble(21);
    }

}

document.body.onkeydown = (e) => {
    // if space is pressed and time is not working - show that timer is ready to start
    if (e.key == " " && !isTimerOn)  {
        e.preventDefault();
        // @ts-ignore
        timerField.classList.add("ready");
    }
    // if any key was pressed during timer is working - stop the timer
    if (e.key && isTimerOn) {
        e.preventDefault();

        stopTimer();
        // @ts-ignore
        const timeValue = timerField.textContent;

        // adding new time on the screen and to the storage
        addNewTime({value: timeValue});

    }
}

// @ts-ignore
resultsTitle.addEventListener("click", () => {
    // @ts-ignore
    if (!bestMode) resultsTitle.textContent = `Best:`
    // @ts-ignore
    else resultsTitle.textContent = `Current:`
    bestMode = !bestMode;
    updateAvgs();
})

// @ts-ignore
resetSessionButton.addEventListener("click", resetSession);

ipcRenderer.on("attempt:delete", (event, data) => {
    const {time, scramble} = data;
    attempts = attempts.filter((attempt)=> {
        // @ts-ignore
        return attempt.time !== time && attempt.scramble !== scramble;
    })
    updateAvgs();
    updateAttemptsField();
    updateStorage();
})

ipcRenderer.on("storage:data", (event, data) => {
    if (data) {
        attempts = data;
        updateAvgs();
        updateAttemptsField();
    }
});