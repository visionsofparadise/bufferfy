import { createIntCodec, Int8Codec } from ".";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { endiannessValues, uIntBitValues } from "../UInt";

const int8Codec = new Int8Codec();
const int8Value: CodecType<typeof int8Codec> = 0 - (2 ** 8 / 2 - 1);

createBenchmark("Int8", int8Value, int8Codec);

for (const endianness of endiannessValues) {
	for (const bits of uIntBitValues) {
		if (bits === 8) continue;

		const codec = createIntCodec(bits, endianness);
		const value: CodecType<typeof codec> = 0 - (2 ** bits / 2 - 1);

		createBenchmark(`Int${bits}${endianness}`, value, codec);
	}
}
