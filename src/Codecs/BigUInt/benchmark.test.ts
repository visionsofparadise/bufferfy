import { createBigUIntCodec } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { endiannessValues } from "../UInt";

for (const endianness of endiannessValues) {
	const codec = createBigUIntCodec(endianness);
	const value: CodecType<typeof codec> = BigInt(512);

	it(
		`encode benchmarks for bigUInt${endianness} codec`,
		async () => {
			await encodeBenchmark(`bigUInt${endianness}`, value, codec);

			expect(true).toBeTruthy();
		},
		5 * 60 * 1000
	);

	it(
		`decode benchmarks for bigUInt${endianness} codec`,
		async () => {
			await decodeBenchmark(`bigUInt${endianness}`, value, codec);

			expect(true).toBeTruthy();
		},
		5 * 60 * 1000
	);

	it(
		`size benchmarks for bigUInt${endianness} codec`,
		async () => {
			await sizeBenchmark(value, codec);

			expect(true).toBeTruthy();
		},
		5 * 60 * 1000
	);
}
