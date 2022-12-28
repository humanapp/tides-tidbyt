import axios, { AxiosError } from "axios";
import { DateTime } from "luxon";
import * as env from "./env";
import * as stations from "./stations";
import { TidbytDevice, TidePredictions } from "./types";

const REFRESH_INTERVAL_MS = 15 * 1000;

const TIDE_PREDICTION_URI = (
    station: string,
    begin_date: DateTime,
    end_date: DateTime
): string => {
    return `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${begin_date.toFormat(
        "yyyyLLdd"
    )}&end_date=${end_date.toFormat(
        "yyyyLLdd"
    )}&station=${station}&product=predictions&datum=MLLW&time_zone=gmt&units=english&application=humanapp.tides&format=json&interval=hilo`;
};

type CachedPrediction = {
    date: string;
    data: TidePredictions;
};

let cachedPredictions: {
    [station: string]: CachedPrediction;
} = {};

async function refreshTidesAsync() {
    try {
        const devices = env.getSetting("TIDBYTS") as TidbytDevice[];
        const stationSet = new Set<string>();
        devices.forEach((d) => stationSet.add(d.tideStation));

        // Clear removed stations
        let oldKeys = Object.keys(cachedPredictions).filter(
            (k) => !stationSet.has(k)
        );
        for (const oldKey of oldKeys) {
            delete cachedPredictions[oldKey];
        }

        // Query three days of data, with current day in the middle
        const today = DateTime.utc();
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
                    throw new Error(
                        `Failed to fetch station ${station} metadata.`
                    );

                const uri = TIDE_PREDICTION_URI(station, yesterday, tomorrow);
                const res = await axios.get(uri);
                const data = res.data as TidePredictions;
                const pred: CachedPrediction = {
                    date: today.toLocaleString(),
                    data,
                };
                cachedPredictions[station] = pred;
                console.debug(`Updated tides for station ${station}`);
            }
        }
    } catch (e: any) {
        if (e instanceof AxiosError && e.response?.data)
            console.error(
                `Tides update failed: ${JSON.stringify(
                    e.response.data,
                    null,
                    2
                )}`
            );
        else console.error(`Tides update failed: ${e.toString()}`);
    } finally {
        setTimeout(async () => await refreshTidesAsync(), REFRESH_INTERVAL_MS);
    }
}

export async function initAsync() {}

export async function startAsync() {
    await refreshTidesAsync();
}
