import { server } from "./server";
import fs from "fs";
import sharp from "sharp";

export async function initAsync() {
    server.get("/api/image", async (req, res) => {
        const s = fs.readFileSync("./tidbyt/tides-today.webp");

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
