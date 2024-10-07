import { createFloatCodec, floatBitValues } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { endiannessValues } from "../UInt";

for (const endianness of endiannessValues) {
	for (const bits of floatBitValues) {
		const codec = createFloatCodec(bits, endianness);
		const value: CodecType<typeof codec> = Math.PI;

		it(
			`encode benchmarks for float${bits}${endianness} codec`,
			async () => {
				await encodeBenchmark(`float${bits}${endianness}`, value, codec);

				expect(true).toBeTruthy();
			},
			5 * 60 * 1000
		);

		it(
			`decode benchmarks for float${bits}${endianness} codec`,
			async () => {
				await decodeBenchmark(`float${bits}${endianness}`, value, codec);

				expect(true).toBeTruthy();
			},
			5 * 60 * 1000
		);

		it(
			`size benchmarks for float${bits}${endianness} codec`,
			async () => {
				await sizeBenchmark(value, codec);

				expect(true).toBeTruthy();
			},
			5 * 60 * 1000
		);
	}
}
