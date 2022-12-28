"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAsync = exports.initAsync = void 0;
const axios_1 = __importStar(require("axios"));
const luxon_1 = require("luxon");
const env = __importStar(require("./env"));
const stations = __importStar(require("./stations"));
const REFRESH_INTERVAL_MS = 15 * 1000;
const TIDE_PREDICTION_URI = (station, begin_date, end_date) => {
    return `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${begin_date.toFormat("yyyyLLdd")}&end_date=${end_date.toFormat("yyyyLLdd")}&station=${station}&product=predictions&datum=MLLW&time_zone=gmt&units=english&application=humanapp.tides&format=json&interval=hilo`;
};
let cachedPredictions = {};
async function refreshTidesAsync() {
    var _a;
    try {
        const devices = env.getSetting("TIDBYTS");
        const stationSet = new Set();
        devices.forEach((d) => stationSet.add(d.tideStation));
        // Clear removed stations
        let oldKeys = Object.keys(cachedPredictions).filter((k) => !stationSet.has(k));
        for (const oldKey of oldKeys) {
            delete cachedPredictions[oldKey];
        }
        // Query three days of data, with current day in the middle
        const today = luxon_1.DateTime.utc();
        const yesterday = today.minus({ days: 1 });
        const tomorrow = today.plus({ days: 1 });
        // Delete stale station data
        for (const station of stationSet) {
            const cached = cachedPredictions[station];
            if (cached && cached.date !== today.toLocaleString()) {
                delete cachedPredictions[station];
            }
        }
        // Update station data
        for (const station of stationSet) {
            if (!cachedPredictions[station]) {
                const smeta = await stations.getStationMetadata(station);
                if (!smeta)
                    throw new Error(`Failed to fetch station ${station} metadata.`);
                const uri = TIDE_PREDICTION_URI(station, yesterday, tomorrow);
                const res = await axios_1.default.get(uri);
                const data = res.data;
                const pred = {
                    date: today.toLocaleString(),
                    data,
                };
                cachedPredictions[station] = pred;
                console.debug(`Updated tides for station ${station}`);
            }
        }
    }
    catch (e) {
        if (e instanceof axios_1.AxiosError && ((_a = e.response) === null || _a === void 0 ? void 0 : _a.data))
            console.error(`Tides update failed: ${JSON.stringify(e.response.data, null, 2)}`);
        else
            console.error(`Tides update failed: ${e.toString()}`);
    }
    finally {
        setTimeout(async () => await refreshTidesAsync(), REFRESH_INTERVAL_MS);
    }
}
async function initAsync() { }
exports.initAsync = initAsync;
async function startAsync() {
    await refreshTidesAsync();
}
exports.startAsync = startAsync;
//# sourceMappingURL=tides.js.map