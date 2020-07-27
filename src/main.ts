import { app, BrowserWindow, ipcMain } from "electron";
import Store from "electron-store";
import  * as path from "path";

const sessionsStore = new Store();


const PRODUCTION = true;

let mainWin: Electron.BrowserWindow;
let infoWin: Electron.BrowserWindow;
// creating main window with timer
function createMainWindow() {
    mainWin = new BrowserWindow({
        width: 900,
        height: 600,
        minHeight: 600,
        minWidth: 900,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    
    if (PRODUCTION)
        infoWin.setMenu(null);
    
    mainWin.loadFile(path.join(__dirname, "./public/mainPage/index.html"));

}

// creating attempt info window
function createInfoWindow() {
    infoWin = new BrowserWindow({
        width: 400,
        height: 300,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    if (PRODUCTION)
        infoWin.setMenu(null);
        
    infoWin.loadFile(path.join(__dirname, "./public/attempt/attempt.html"));

}

app.on("ready", createMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// creating new window on command show-info
ipcMain.on('window:show-info',async (event, data) =>{
    if (infoWin) {
        infoWin.destroy();
    }
    await createInfoWindow();
    setTimeout(()=> {
        // sending info about attempt after timeout(waiting for window loaded)
        infoWin.webContents.send("attempt:info", data);
    }, 300);

});

// delete attempt command, sends command to delete attempt in the main window
ipcMain.on('attempt:delete', (event, data) => {
    infoWin.destroy();
    mainWin.webContents.send("attempt:delete", data);
});

ipcMain.on("storage:update", (event, data) => {
    const { discipline, attempts } = data;
    let currentDisciplineStorage: any = sessionsStore.get(`sessions.${discipline}`);

    if (!currentDisciplineStorage) {
        sessionsStore.set(`sessions.${discipline}`, attempts);
    } else {
        currentDisciplineStorage.push(attempts);
        sessionsStore.set(`sessions.${discipline}`, attempts);
    }
})

ipcMain.on("storage:get", (event, discipline) => {
    const attempts = sessionsStore.get(`sessions.${discipline}`);
    mainWin.webContents.send("storage:data", attempts);
})
