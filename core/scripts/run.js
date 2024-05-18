const { spawn } = require('child_process');
const fs = require('fs');

let child = null;
let outputLogs = [];

function start() {
  child = spawn('node', ['jdparty.js']);

  child.stdout.on('data', (data) => {
    process.stdout.write(`${data}`);
    const log = {
      method: 'LOG',
      url: data.toString().trim(),
      timestamp: new Date().toISOString()
    };
    outputLogs.push(log);

    fs.writeFile('database/tmp/logs.txt', JSON.stringify(outputLogs), (err) => {
      if (err) throw err;
    });
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`${data}`);
    const log = {
      method: 'LOG ERROR',
      url: data.toString().trim(),
      timestamp: new Date().toISOString()
    };
    outputLogs.push(log);

    fs.writeFile('database/tmp/logs.txt', JSON.stringify(outputLogs), (err) => {
      if (err) throw err;
    });
  });

  child.on('exit', (code) => {
    console.log(`[PARTY] child process exited with code ${code}`);
    if (code === 42) { // Replace 42 with your desired exit code
      start(); // Restart the process
    }
  });
}

function generateLog(req, res, next) {
  counted++;
  if (!req.url.startsWith('/party/panel/')) {
    const log = {
      timestamp: new Date().toISOString(),
      message: `[PARTY] ${req.method} ${req.url}`
    };
    requestLogs.push(log);
    if (requestLogs.length > 50) {
      requestLogs.shift();
    }
    fs.appendFile('database/tmp/logs.txt', `${JSON.stringify(log)}\n`, (err) => {
      if (err) throw err;
    });
  }
  next();
}

start();
