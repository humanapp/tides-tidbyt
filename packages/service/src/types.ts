export type ServiceResult<T> = {
    status: number;
    statusText?: string;
    data?: T;
};

export type TidePrediction = {
    t: Date; // raw values look like 2022-12-26 00:17
    v: number; // height in feet
    type: "L" | "H"; // low or high prediction
};

export type TidePredictions = {
    predictions: TidePrediction[];
};

export type TidbytDevice = {
    tideStation: string; // NOAA station id (for tide preditions)
    deviceId: string; // Tidbyt deviceId
    apiKey: string; // Tidbyt apiKey
};

// NOAA Tide Station
export type StationMetadata = {
    id: string;
    name: string;
    timezone: string;
    timezonecorr: number;
    observedst: boolean;
    lat: number;
    lng: number;
};
