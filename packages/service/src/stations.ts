import axios, { AxiosError } from "axios";
import { StationMetadata } from "./types";

const STATION_METADATA_API = (station: string) =>
    `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${station}.json?type=waterlevels&units=english`;

const cachedStations: {
    [station: string]: StationMetadata;
} = {};

export async function getStationMetadata(station: string) {
    try {
        if (cachedStations[station]) {
            return cachedStations[station];
        }
        const uri = STATION_METADATA_API(station);
        const res = await axios.get(uri);
        const data = res.data as StationMetadata;
        cachedStations[station] = data;
        console.debug(`Fetched metadata for station ${station}`);
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
