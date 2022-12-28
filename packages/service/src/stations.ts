import axios, { AxiosError } from "axios";
import { StationMetadata } from "./types";

const STATION_METADATA_API = (stationId: string) =>
    `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationId}.json?type=waterlevels&units=english`;

const cachedStations: {
    [station: string]: StationMetadata;
} = {};

export async function getStationMetadata(stationId: string) {
    try {
        if (cachedStations[stationId]) {
            return cachedStations[stationId];
        }
        const uri = STATION_METADATA_API(stationId);
        const res = await axios.get(uri);
        const data = res.data as StationMetadata;
        cachedStations[stationId] = data;
        console.debug(`Fetched metadata for station ${stationId}`);
        return data;
    } catch (e: any) {
        if (e instanceof AxiosError && e.response?.data)
            console.error(
                `Fetch station metadata failed: ${JSON.stringify(
                    e.response.data,
                    null,
                    2
                )}`
            );
        else console.error(`Fetch station metadata failed: ${e.toString()}`);
    }
}

export async function initAsync() {}

export async function startAsync() {}
