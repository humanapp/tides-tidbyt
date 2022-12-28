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
exports.startAsync = exports.initAsync = exports.getStationMetadata = void 0;
const axios_1 = __importStar(require("axios"));
const STATION_METADATA_API = (stationId) => `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationId}.json?type=waterlevels&units=english`;
const cachedStations = {};
async function getStationMetadata(stationId) {
    var _a;
    try {
        if (cachedStations[stationId]) {
            return cachedStations[stationId];
        }
        const uri = STATION_METADATA_API(stationId);
        const res = await axios_1.default.get(uri);
        const data = res.data;
        cachedStations[stationId] = data;
        console.debug(`Fetched metadata for station ${stationId}`);
        return data;
    }
    catch (e) {
        if (e instanceof axios_1.AxiosError && ((_a = e.response) === null || _a === void 0 ? void 0 : _a.data))
            console.error(`Fetch station metadata failed: ${JSON.stringify(e.response.data, null, 2)}`);
        else
            console.error(`Fetch station metadata failed: ${e.toString()}`);
    }
}
exports.getStationMetadata = getStationMetadata;
async function initAsync() { }
exports.initAsync = initAsync;
async function startAsync() { }
exports.startAsync = startAsync;
//# sourceMappingURL=stations.js.map