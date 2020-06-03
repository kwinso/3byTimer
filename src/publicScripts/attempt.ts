import { ipcRenderer } from "electron";

// elements
const scrambleField = document.querySelector("#scrambleField");
const timeField = document.querySelector("#timeField");
const messageField = document.querySelector("#message");
const deleteButton = document.querySelector("#deleteButton");
let attemptTime :string, attemptScramble : string;

ipcRenderer.on("attempt:info", (event, data) => {
    let {time, scramble, role } = data;
    attemptScramble = scramble;
    attemptTime = time;
    document.title = scramble;
    console.log(role);

    switch (role) {
        case "best":
            // @ts-ignore
            messageField.textContent = "This is your best attempt!";
            // @ts-ignore
            messageField.classList.add("best");
            // @ts-ignore
            timeField.classList.add("best");
            break;
        case "worst":
            // @ts-ignore
            messageField.textContent = "This is your worst attempt!";
            // @ts-ignore
            messageField.classList.add("worst");
            // @ts-ignore
            timeField.classList.add("worst");
            break;
    }
    // @ts-ignore
    timeField.textContent = time;
    // @ts-ignore
    scrambleField.textContent = scramble;
})


// @ts-ignore
deleteButton.addEventListener("click", () => {
    ipcRenderer.send("attempt:delete", {time: attemptTime, scramble: attemptScramble});
})