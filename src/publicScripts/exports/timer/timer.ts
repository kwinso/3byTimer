import {isTimerOn} from "../../index";


let timerInterval: NodeJS.Timeout;

export function startTimer({timerField}: { timerField: any }) {
    const startedTime = Date.now();

     timerInterval = setInterval(() => {
         if (!isTimerOn) clearInterval(timerInterval);

        const currentTime = Date.now();
        const timePassed = currentTime - startedTime;

        // set value for timer field in seconds
         let time = ((timePassed / 1000).toFixed(2));
         if (parseFloat(time) > 60) {
             const splittedTime: string[] = time.toString().split('.');
             const minutes: number = Math.floor(parseInt(splittedTime[0]) / (60));
             const seconds: number = parseFloat(time) - minutes * (60);
             if (seconds < 10) {
                 time = `${minutes}:0${(seconds).toFixed(2)}`;
             } else {
                 time =  `${minutes}:${(seconds).toFixed(2)}`;
             }
         }
        timerField.textContent = time;
    }, 1)
}


export function stopTimer() {
    return clearInterval(timerInterval);
}