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
exports.startAsync = exports.initAsync = exports.fetchTidesForStationAsync = void 0;
const axios_1 = __importStar(require("axios"));
const luxon_1 = require("luxon");
const stations = __importStar(require("./stations"));
const REFRESH_INTERVAL_MS = 15 * 1000;
const TIDE_PREDICTION_URI = (stationId, begin_date, end_date) => {
    return `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${begin_date.toFormat("yyyyLLdd")}&end_date=${end_date.toFormat("yyyyLLdd")}&station=${stationId}&product=predictions&datum=MLLW&time_zone=gmt&units=english&application=humanapp.tides&format=json&interval=hilo`;
};
let cachedPredictions = {};
async function fetchTidesForStationAsync(stationId) {
    var _a, _b;
    try {
        const today = luxon_1.DateTime.utc();
        // Delete stale cached data
        if (cachedPredictions[stationId] &&
            cachedPredictions[stationId].date !== today.toLocaleString()) {
            delete cachedPredictions[stationId];
        }
        if (!cachedPredictions[stationId]) {
            const smeta = await stations.getStationMetadata(stationId);
            if (!smeta)
                throw new Error(`Failed to fetch station ${stationId} metadata.`);
            // Query three days of data, with current day in the middle
            const yesterday = today.minus({ days: 1 });
            const tomorrow = today.plus({ days: 1 });
            const uri = TIDE_PREDICTION_URI(stationId, yesterday, tomorrow);
            const res = await axios_1.default.get(uri);
            const data = res.data;
            const pred = {
                date: today.toLocaleString(),
                data,
            };
            cachedPredictions[stationId] = pred;
            console.debug(`Updated tides for station ${stationId}`);
        }
        return (_a = cachedPredictions[stationId]) === null || _a === void 0 ? void 0 : _a.data;
    }
    catch (e) {
        if (e instanceof axios_1.AxiosError && ((_b = e.response) === null || _b === void 0 ? void 0 : _b.data))
            console.error(`Tides update failed: ${JSON.stringify(e.response.data, null, 2)}`);
        else
            console.error(`Tides update failed: ${e.toString()}`);
        return undefined;
    }
}
exports.fetchTidesForStationAsync = fetchTidesForStationAsync;
async function initAsync() { }
exports.initAsync = initAsync;
async function startAsync() { }
exports.startAsync = startAsync;
//# sourceMappingURL=tides.js.map