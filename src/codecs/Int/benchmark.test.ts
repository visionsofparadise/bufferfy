import { createIntCodec, Int8Codec } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { endiannessValues, uIntBitValues } from "../UInt";

const int8Codec = new Int8Codec();
const int8Value: CodecType<typeof int8Codec> = 0 - (2 ** 8 / 2 - 1);

it(
	"encode benchmarks for int8 codec",
	async () => {
		await encodeBenchmark("int8", int8Value, int8Codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for int8 codec",
	async () => {
		await decodeBenchmark("int8", int8Value, int8Codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for int8 codec",
	async () => {
		await sizeBenchmark(int8Value, int8Codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

for (const endianness of endiannessValues) {
	for (const bits of uIntBitValues) {
		if (bits === 8) continue;

		const codec = createIntCodec(bits, endianness);
		const value: CodecType<typeof codec> = 0 - (2 ** bits / 2 - 1);

		it(
			`encode benchmarks for int${bits}${endianness} codec`,
			async () => {
				await encodeBenchmark(`int${bits}${endianness}`, value, codec);

				expect(true).toBeTruthy();
			},
			5 * 60 * 1000
		);

		it(
			`decode benchmarks for int${bits}${endianness} codec`,
			async () => {
				await decodeBenchmark(`int${bits}${endianness}`, value, codec);

				expect(true).toBeTruthy();
			},
			5 * 60 * 1000
		);

		it(
			`size benchmarks for int${bits}${endianness} codec`,
			async () => {
				await sizeBenchmark(value, codec);

				expect(true).toBeTruthy();
			},
			5 * 60 * 1000
		);
	}
}
