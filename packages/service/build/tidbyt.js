"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAsync = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("./env");
const worker_1 = require("./worker");
const fs_1 = __importDefault(require("fs"));
const REFRESH_INTERVAL_MS = 20 * 1000;
let prevWebp;
async function generateStationImageAsync(stationId) {
    try {
        const renderExitCode = await (0, worker_1.spawnAsync)(`pixlet`, [
            "render",
            "./tidbyt/tides-today.star",
            "-o",
            `./tidbyt/tides-today-${stationId}.webp`,
            `stationId=${stationId}`,
        ]);
    }
    catch (e) {
        console.error(`Station image update failed: ${e.toString()}`);
    }
}
async function updateStationImagesAsync() { }
async function updateTidbytsAsync() {
    try {
        const renderExitCode = await (0, worker_1.spawnAsync)(`pixlet`, [
            "render",
            "./tidbyt/ferry-status.star",
        ]);
        if (renderExitCode) {
            console.error(`pixlet render exited with code ${renderExitCode}`);
        }
        else {
            const webp = fs_1.default.readFileSync("./tidbyt/ferry-status.webp", "base64");
            if (prevWebp !== webp) {
                prevWebp = webp;
                const data = {
                    deviceID: (0, env_1.getSetting)("TIDBYT_DEVICE_ID"),
                    image: webp,
                    installationID: "ferry",
                    background: true,
                };
                const config = {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${(0, env_1.getSetting)("TIDBYT_APIKEY")}`,
                    },
                };
                const res = await axios_1.default.post(`https://api.tidbyt.com/v0/devices/${(0, env_1.getSetting)("TIDBYT_DEVICE_ID")}/push`, data, config);
                if (res.status !== 200) {
                    throw new Error(res.statusText);
                }
                console.log("Tidbyt updated");
            }
        }
    }
    catch (err) {
        console.error(`Tidbyt update failed: ${err.toString()}`);
    }
    setTimeout(async () => await updateTidbytsAsync(), REFRESH_INTERVAL_MS);
}
async function startAsync() {
    // Short delay before initial update
    //setTimeout(async () => await updateTidbytsAsync(), 1000);
}
exports.startAsync = startAsync;
//# sourceMappingURL=tidbyt.js.map