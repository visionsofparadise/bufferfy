import { pack, unpack } from "msgpackr";
import { bench, describe, expect, it } from "vitest";
import type { AbstractCodec } from "../Codecs/Abstract";
import { Context } from "./Context";

export const createBenchmark = (name: string, value: any, codec: AbstractCodec) => {
	describe(name, () => {
		const bufferfyEncoded = codec.encode(value);
		const msgpackEncoded = pack(value);
		const jsonEncoded = new TextEncoder().encode(JSON.stringify(value));

		const byteLength = codec.byteLength(value);
		const encodeBuffer = new Uint8Array(byteLength);
		const encodeContext = new Context();
		const decodeContext = new Context();

		describe("encode", () => {
			bench(
				"bufferfy",
				() => {
					codec._encode(value, encodeBuffer, encodeContext);
				},
				{
					setup: () => {
						encodeContext.offset = 0;
					},
				}
			);

			bench("msgpack", () => {
				pack(value);
			});

			bench("json", () => {
				new TextEncoder().encode(JSON.stringify(value));
			});
		});

		describe("decode", () => {
			bench(
				"bufferfy",
				() => {
					codec._decode(bufferfyEncoded, decodeContext);
				},
				{
					setup: () => {
						decodeContext.offset = 0;
					},
				}
			);

			bench("msgpack", () => {
				unpack(msgpackEncoded);
			});

			bench("json", () => {
				JSON.parse(new TextDecoder().decode(jsonEncoded));
			});
		});

		it("size comparison", () => {
			const sizes = {
				bufferfy: bufferfyEncoded.byteLength,
				msgpack: msgpackEncoded.byteLength,
				json: jsonEncoded.byteLength,
			};

			console.log(`\n${name} sizes:`);
			console.log(`  bufferfy: ${sizes.bufferfy} bytes`);
			console.log(`  msgpack:  ${sizes.msgpack} bytes (${((sizes.msgpack / sizes.bufferfy) * 100).toFixed(1)}%)`);
			console.log(`  json:     ${sizes.json} bytes (${((sizes.json / sizes.bufferfy) * 100).toFixed(1)}%)`);

			expect(sizes.bufferfy).toBeGreaterThan(0);
		});
	});
};
