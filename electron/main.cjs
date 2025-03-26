// Modules to control application life and create native browser window
const { log } = require('console')
const { app, BrowserWindow, screen, ipcMain, globalShortcut } = require('electron')
const path = require('path')
const fs = require('fs')
const http = require('http')
const { Server } = require('socket.io')
const chokidar = require('chokidar')

if (require('electron-squirrel-startup')) app.quit();

const isDevEnvironment = process.env.DEV_ENV === 'true'

// enable live reload for electron in dev mode
if (isDevEnvironment) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

let mainWindow;
let io;
let watcher;

// Function to get file information for the current directory
function getDirectoryFiles(directory) {
    try {
        const files = fs.readdirSync(directory);
        return files.map(file => {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size,
                isDirectory: stats.isDirectory(),
                mtime: stats.mtime.getTime()
            };
        }).sort((a, b) => {
            // Directories first, then files alphabetically
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

// Handle close window event from renderer
ipcMain.on('close-window', () => {
    if (mainWindow) {
        mainWindow.close();
    }
});

const createWindow = () => {
    
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 450,
        height: 800,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        hasShadow: true,
        backgroundColor: '#00000000', // Transparent background
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            devTools: true
        }
    })

    // Position window to the right of the screen
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width } = primaryDisplay.workAreaSize
    mainWindow.setPosition(width - 450, 0)

    // Enable drag regions
    if (!isDevEnvironment) {
        // For production, we need to set it after the app is loaded
        mainWindow.webContents.once('did-finish-load', () => {
            // The header will be draggable
            mainWindow.webContents.send('set-draggable');
        });
    }

    // define how electron will load the app
    if (isDevEnvironment) {

        // if your vite app is running on a different port, change it here
        mainWindow.loadURL('http://localhost:5173/');

        // DevTools should start closed - remove the auto-open
        // MainWindow will still have DevTools available
        
        log('Electron running in dev mode: 🧪')

    } else {
        
        // when not in dev mode, load the build file instead
        mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

        log('Electron running in prod mode: 🚀')
    }
    
    // Set up Socket.IO server
    setupSocketIO();
    
    // Register F12 shortcut to toggle DevTools
    globalShortcut.register('F12', () => {
        if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools();
        } else {
            mainWindow.webContents.openDevTools();
        }
    });
}

// Set up Socket.IO server
function setupSocketIO() {
    const server = http.createServer();
    io = new Server(server, {
        cors: {
            origin: isDevEnvironment ? "http://localhost:5173" : "*",
            methods: ["GET", "POST"]
        }
    });
    
    const port = isDevEnvironment ? 3000 : 3000;
    server.listen(port, () => {
        console.log(`Socket.IO server running on port ${port}`);
    });
    
    // Handle socket connections
    io.on('connection', (socket) => {
        console.log('Client connected');
        
        // Send initial files list when requested
        socket.on('get-files', () => {
            const currentDir = process.cwd();
            const files = getDirectoryFiles(currentDir);
            socket.emit('files-updated', files);
        });
        
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
    
    // Set up file watcher
    setupFileWatcher();
}

// Set up file watcher
function setupFileWatcher() {
    const currentDir = process.cwd();
    
    // Initialize watcher
    watcher = chokidar.watch(currentDir, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    });
    
    // Add event listeners
    watcher
        .on('add', path => updateFilesList())
        .on('change', path => updateFilesList())
        .on('unlink', path => updateFilesList())
        .on('addDir', path => updateFilesList())
        .on('unlinkDir', path => updateFilesList());
        
    console.log(`Watching for file changes in ${currentDir}`);
}

// Update and broadcast files list
function updateFilesList() {
    if (io) {
        const currentDir = process.cwd();
        const files = getDirectoryFiles(currentDir);
        io.emit('files-updated', files);
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
    
    // Register Command+Q shortcut for macOS to quit the app
    if (process.platform === 'darwin') {
        globalShortcut.register('CommandOrControl+Q', () => {
            app.quit();
        });
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    // We want to quit on all platforms when all windows are closed
    app.quit();
});

// Clean up resources when app is about to quit
app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
    
    if (watcher) {
        watcher.close();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.