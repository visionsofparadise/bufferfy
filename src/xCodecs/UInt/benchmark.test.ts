import { createUIntCodec, endiannessValues, UInt8Codec, uIntBitValues } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";

const uInt8Codec = new UInt8Codec();
const uInt8: CodecType<typeof uInt8Codec> = 2 ** 8 - 1;

it(
	"encode benchmarks for uInt8 codec",
	async () => {
		await encodeBenchmark("uInt8", uInt8, uInt8Codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for uInt8 codec",
	async () => {
		await decodeBenchmark("uInt8", uInt8, uInt8Codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for uInt8 codec",
	async () => {
		await sizeBenchmark(uInt8, uInt8Codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

for (const endianness of endiannessValues) {
	for (const bits of uIntBitValues) {
		if (bits === 8) continue;

		const codec = createUIntCodec(bits, endianness);
		const value: CodecType<typeof codec> = 2 ** bits - 1;

		it(
			`encode benchmarks for uInt${bits}${endianness} codec`,
			async () => {
				await encodeBenchmark(`uInt${bits}${endianness}`, value, codec);

				expect(true).toBeTruthy();
			},
			5 * 60 * 1000
		);

		it(
			`decode benchmarks for uInt${bits}${endianness} codec`,
			async () => {
				await decodeBenchmark(`uInt${bits}${endianness}`, value, codec);

				expect(true).toBeTruthy();
			},
			5 * 60 * 1000
		);

		it(
			`size benchmarks for uInt${bits}${endianness} codec`,
			async () => {
				await sizeBenchmark(value, codec);

				expect(true).toBeTruthy();
			},
			5 * 60 * 1000
		);
	}
}
