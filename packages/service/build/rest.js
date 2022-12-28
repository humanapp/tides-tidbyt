"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAsync = void 0;
const server_1 = require("./server");
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
async function initAsync() {
    server_1.server.get("/api/image/:stationId", async (req, res) => {
        const stationId = req.params.stationId;
        const fname = `./tidbyt/tides-${stationId}.webp`;
        if (!fs_1.default.existsSync(fname)) {
            // generate
        }
        const s = fs_1.default.readFileSync(fname);
        const b = await (0, sharp_1.default)(s, { pages: -1 })
            .resize({
            height: 320,
            kernel: sharp_1.default.kernel.nearest,
        })
            .withMetadata()
            .toBuffer();
        res.header("Content-Type", "image/webp");
        res.send(b);
    });
}
exports.initAsync = initAsync;
//# sourceMappingURL=rest.js.map