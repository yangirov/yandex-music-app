const { app, BrowserWindow, BrowserView } = require("electron");
const path = require("path");

const defaultWindowWidth = 1301;
const defaultWindowHeight = 768;

let win;
let willQuitApp = false;

app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling,MediaSessionService");

app.on("before-quit", () => (willQuitApp = true));
app.on("activate", () => {
  if (win) {
    win.show();
  }
});

app.on("ready", () => {
  win = new BrowserWindow({
    width: defaultWindowWidth,
    height: defaultWindowHeight,
    title: "Яндекс.Музыка",
    webPreferences: {
      preload: path.join(__dirname, "../renderer/preload.js"),
    },
  });
  exports.showLoader();
  win.loadURL("https://music.yandex.ru");
  global.mainWindow = win;

  require("./features");

  win.on("close", (e) => {
    if (willQuitApp) {
      win = null;
    } else {
      e.preventDefault();
      win.hide();
    }
  });
});

app.setAsDefaultProtocolClient("yandex-music-app");

app.on("open-url", (event, url) => {
  event.preventDefault();
  global.mainWindow.loadURL("https://music.yandex.ru/" + url.replace('yandex-music-app:/', ''));
});

exports.showLoader = () => {
  let view = new BrowserView();
  win.setBrowserView(view);
  let [width, height] = win.getSize();
  view.setBounds({ x: 0, y: 0, width: width, height: height });
  view.setAutoResize({ width: true, height: true, horizontal: true, vertical: true });
  view.webContents.loadFile("src/renderer/loader.html");

  win.webContents.once("dom-ready", () => {
    win.removeBrowserView(view);
    view.destroy();
  });
};
