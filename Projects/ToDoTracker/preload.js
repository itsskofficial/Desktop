const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	submitVideo: (filePath) => {
		ipcRenderer.send("video:submit", filePath);
	},
	receiveVideoMetadata: (onMetadataReceived) => {
		ipcRenderer.on("video:metadata", (event, duration) => {
			onMetadataReceived(duration);
		});
	},
});
