import { pack, unpack } from "msgpackr";
import { bench, describe, expect, it } from "vitest";
import type { AbstractCodec } from "../Codecs/Abstract";
import { Writer } from "./Writer";
import { Reader } from "./Reader";

export const createBenchmark = (name: string, value: any, codec: AbstractCodec) => {
	describe(name, () => {
		const bufferfyEncoded = codec.encode(value);
		const msgpackEncoded = pack(value);
		const jsonEncoded = new TextEncoder().encode(JSON.stringify(value));

		describe("encode", () => {
			bench("bufferfy", () => {
				const writer = new Writer();
				codec._encode(value, writer);
				writer.toBuffer();
			});

			bench("msgpack", () => {
				pack(value);
			});

			bench("json", () => {
				new TextEncoder().encode(JSON.stringify(value));
			});
		});

		describe("decode", () => {
			bench("bufferfy", () => {
				const reader = new Reader(bufferfyEncoded);
				codec._decode(reader);
			});

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
