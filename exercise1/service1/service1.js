const fs = require("fs");
const http = require("http");
const axios = require("axios");

const logFilePath = "/usr/src/logs/service1.log";
// const logFilePath = "/var/log/logs/service1.log";
const service2Url = "http://172.20.0.2:8000";

function writeToLogFile(filename, data) {
  // If the file doesn't exist, create it with a .log extension
  if (!fs.existsSync(filename)) {
    filename = `${filename}.log`;
  }

  // Append the data to the file
  fs.appendFileSync(filename, data);

  console.log(
    `   Data has been written to ${filename} and data ${data}` + "\n"
  );
}

const writeLog = (message) => {
  fs.appendFile(logFilePath, message + "\n", (err) => {
    console.log(message);
    if (err) {
      console.error("Error writing to service1.log:", err);
    }
  });
};

const sendRequestToService2 = async (message) => {
  try {
    await axios.get(`${service2Url}?message=${message}`);
  } catch (error) {
    writeToLogFile("service1.log", `error: ${error.message}`);
  }
};

const run = async () => {
  try {
    const logFile = fs.createWriteStream(logFilePath);

    for (let i = 0; i < 20; i++) {
      const timestamp = new Date().toISOString();
      const address = "172.20.0.1:3000";
      const logMessage = `${i} ${timestamp} ${address}  \n`;
      //   console.log(logMessage);
      // Write to the log file
      writeToLogFile("service1.log", logMessage);
      //   console.log(logMessage);
      // Send the text with HTTP protocol to Service 2
      await sendRequestToService2(logMessage);

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
    }

    // After the 20 rounds
    writeToLogFile("service1.log", "STOP");
    await sendRequestToService2("STOP");

    logFile.end();
  } catch (error) {
    console.error("Service 1 error:", error);
  }
};

run();
