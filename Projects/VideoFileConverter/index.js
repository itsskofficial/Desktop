const electron = require("electron")
const ffmpeg = require("fluent-ffmpeg");
const _ = require("lodash");

const { app, shell, BrowserWindow, ipcMain } = electron

let mainWindow

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        title: "Video File Converter",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
            backgroundThrottling: false
        },
    });

    mainWindow.loadURL(`file://${__dirname}/src/index.html`)
})

ipcMain.on("videos:added", (event, videos) => {
    const getMetadata = _.map(videos, video => {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(video.path, (err, metadata) => {
                if (err) {
                    reject(err)
                } else {
                    resolve({
                        ...video,
                        duration: metadata.format.duration,
                        format: metadata.format.format_name
                    })
                }
            })
        })
    })

    Promise.all(getMetadata)
        .then(metadata => {
            event.sender.send("metadata:complete", metadata)
        })
        .catch(err => console.log(err))
})

ipcMain.on("conversion:start", (event, videos) => {
    _.each(videos, video => {
        const video = videos[0];
		const outputDir = video.path.split(video.name)[0];
		const outputName = video.name.split(".")[0];
		const outputPath = path.join(outputDir, outputName + "-converted.mp4");
		ffmpeg(video.path)
            .output(outputPath)
            .on("progress", ({ timemark }) => {
                event.sender.send("conversion:progress", { video, timemark })
            })
			.on("end", () => {
                event.sender.send("conversion:complete", { video, outputPath });
			})
			.run();
    })  
})

ipcMain.on("folder:open", (event, outputPath) => {
    shell.showItemInFolder(outputPath);
})
