import axios from "axios";
import { getSetting } from "./env";
import { spawnAsync } from "./worker";
import fs from "fs";

const REFRESH_INTERVAL_MS = 20 * 1000;

let prevWebp: string;

async function generateStationImageAsync(stationId: string) {
    try {
        const renderExitCode = await spawnAsync(`pixlet`, [
            "render",
            "./tidbyt/tides-today.star",
            "-o",
            `./tidbyt/tides-today-${stationId}.webp`,
            `stationId=${stationId}`,
        ]);
    } catch (e: any) {
        console.error(`Station image update failed: ${e.toString()}`);
    }
}

async function updateStationImagesAsync() {}

async function updateTidbytsAsync() {
    try {
        const renderExitCode = await spawnAsync(`pixlet`, [
            "render",
            "./tidbyt/ferry-status.star",
        ]);
        if (renderExitCode) {
            console.error(`pixlet render exited with code ${renderExitCode}`);
        } else {
            const webp = fs.readFileSync(
                "./tidbyt/ferry-status.webp",
                "base64"
            );
            if (prevWebp !== webp) {
                prevWebp = webp;

                const data = {
                    deviceID: getSetting("TIDBYT_DEVICE_ID"),
                    image: webp,
                    installationID: "ferry",
                    background: true,
                };
                const config = {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${getSetting("TIDBYT_APIKEY")}`,
                    },
                };

                const res = await axios.post(
                    `https://api.tidbyt.com/v0/devices/${getSetting(
                        "TIDBYT_DEVICE_ID"
                    )}/push`,
                    data,
                    config
                );

                if (res.status !== 200) {
                    throw new Error(res.statusText);
                }

                console.log("Tidbyt updated");
            }
        }
    } catch (err: any) {
        console.error(`Tidbyt update failed: ${err.toString()}`);
    }

    setTimeout(async () => await updateTidbytsAsync(), REFRESH_INTERVAL_MS);
}

export async function startAsync() {
    // Short delay before initial update
    //setTimeout(async () => await updateTidbytsAsync(), 1000);
}
