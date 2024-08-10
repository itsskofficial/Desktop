const electron = require("electron");
const path = require("path")

const { app, Tray, BroswerWindow } = electron;

let mainWindow;
let tray;

app.on("ready", () => {
    mainWindow = new BroswerWindow({
        height: 300,
        width: 300,
        frame: false,
        resizable: false,
    });
    
    mainWindow.loadURL("file://${__dirname}/src/index.html");
    
    const iconName = process.platform === "win32" ? "windows-icon.png" : "icon-template.png"
    const iconPath = path.join(__dirname, `./src/assets/${iconName}`)
    let tray = new Tray(iconPath)
    tray.on("click", () => {
        mainWindow.show()
    })

    mainWindow.on("blur", () => {
        if (!app.open) {}
    })
});