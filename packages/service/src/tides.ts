import axios, { AxiosError } from "axios";
import { DateTime } from "luxon";
import * as env from "./env";
import * as stations from "./stations";
import { TidbytDevice, TidePredictions } from "./types";

const REFRESH_INTERVAL_MS = 15 * 1000;

const TIDE_PREDICTION_URI = (
    stationId: string,
    begin_date: DateTime,
    end_date: DateTime
): string => {
    return `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${begin_date.toFormat(
        "yyyyLLdd"
    )}&end_date=${end_date.toFormat(
        "yyyyLLdd"
    )}&station=${stationId}&product=predictions&datum=MLLW&time_zone=gmt&units=english&application=humanapp.tides&format=json&interval=hilo`;
};

type CachedPrediction = {
    date: string;
    data: TidePredictions;
};

let cachedPredictions: {
    [station: string]: CachedPrediction;
} = {};

export async function fetchTidesForStationAsync(
    stationId: string
): Promise<TidePredictions | undefined> {
    try {
        const today = DateTime.utc();

        // Delete stale cached data
        if (
            cachedPredictions[stationId] &&
            cachedPredictions[stationId].date !== today.toLocaleString()
        ) {
            delete cachedPredictions[stationId];
        }

        if (!cachedPredictions[stationId]) {
            const smeta = await stations.getStationMetadata(stationId);
            if (!smeta)
                throw new Error(
                    `Failed to fetch station ${stationId} metadata.`
                );

            // Query three days of data, with current day in the middle
            const yesterday = today.minus({ days: 1 });
            const tomorrow = today.plus({ days: 1 });

            const uri = TIDE_PREDICTION_URI(stationId, yesterday, tomorrow);
            const res = await axios.get(uri);
            const data = res.data as TidePredictions;
            const pred: CachedPrediction = {
                date: today.toLocaleString(),
                data,
            };
            cachedPredictions[stationId] = pred;
            console.debug(`Updated tides for station ${stationId}`);
        }

        return cachedPredictions[stationId]?.data;
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
        return undefined;
    }
}

export async function initAsync() {}

export async function startAsync() {}
