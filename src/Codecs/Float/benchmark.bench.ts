import { createFloatCodec, floatBitValues } from ".";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { endiannessValues } from "../UInt";

for (const endianness of endiannessValues) {
	for (const bits of floatBitValues) {
		const codec = createFloatCodec(bits, endianness);
		const value: CodecType<typeof codec> = Math.PI;

		createBenchmark(`Float${bits}${endianness}`, value, codec);
	}
}
