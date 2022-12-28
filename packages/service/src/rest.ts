import { server } from "./server";
import fs from "fs";
import sharp from "sharp";

export async function initAsync() {
    server.get("/api/image/:stationId", async (req, res) => {
        const stationId = (req.params as any).stationId;
        const fname = `./tidbyt/tides-${stationId}.webp`;
        if (!fs.existsSync(fname)) {
            // generate
        }
        const s = fs.readFileSync(fname);
        const b = await sharp(s, { pages: -1 })
            .resize({
                height: 320,
                kernel: sharp.kernel.nearest,
            })
            .withMetadata()
            .toBuffer();

        res.header("Content-Type", "image/webp");
        res.send(b);
    });
}
