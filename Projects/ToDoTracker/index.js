const electron = require("electron")
const path = require("path")

const {app, BrowserWindow, Menu, ipcMain} = electron

let mainWindow
let addWindow

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`)
    mainWindow.on("closed", () => app.quit())

    const mainMenu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(mainMenu)
})

const createAddWindow = () => {
    addWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
        width: 300,
        height: 200,
        title: "Add New Todo",
        autoHideMenuBar: true,
    });

    addWindow.loadURL(`file://${__dirname}/add.html`)
    addWindow.on("closed", () => {
        addWindow = null
    })
}

ipcMain.on("todo:add", (event, todo) => {
    mainWindow.webContents.send("todo:add", todo)
    addWindow.close()
})

const menuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "New Todo",
                click() {
                    createAddWindow()
                }
            },
            {
                label: "Clear Todos",
                click() {
                    mainWindow.webContents.send("todo:clear")
                }
            }
            {
                label: "Quit",
                click() {
                    app.quit()
                },
                accelerator: (() => {
                    if (process.platform === "win32") {
                        return "Ctrl+Q"
                    } else if (process.platform === "darwin") {
                        return "Command+Q"
                    }
                })()
            }
        ]
    }
]

if (process.platform === "darwin") {
    menuTemplate.unshift({label: ""})
}

if (process.env.NODE_ENV === "development") {
    menuTemplate.push({
        label: "View",
        submenu: [
            {
                role: "reload"
            },
            {
                label: "Toggle Developer Tools",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                },
                accelerator: process.platform === "darwin" ? "Command+Alt+I" : "Ctrl+Shift+I"
            }
        ]
    })
}