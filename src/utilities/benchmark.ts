import { pack, unpack } from "msgpackr";
import { bench, describe, expect, it } from "vitest";
import type { AbstractCodec } from "../Codecs/Abstract";
import { Reader } from "./Reader";

// JSON.stringify throws on bigint; stringify bigints so bigint-bearing codecs (BigUInt, Number) can be benchmarked against JSON.
const jsonReplacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export const createBenchmark = (name: string, value: any, codec: AbstractCodec) => {
	describe(name, () => {
		const bufferfyEncoded = codec.encode(value);
		const msgpackEncoded = pack(value);
		const jsonEncoded = new TextEncoder().encode(JSON.stringify(value, jsonReplacer));

		describe("encode", () => {
			bench("bufferfy", () => {
				codec.encode(value);
			});

			bench("msgpack", () => {
				pack(value);
			});

			bench("json", () => {
				new TextEncoder().encode(JSON.stringify(value, jsonReplacer));
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
