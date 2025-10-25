import { createUIntCodec, endiannessValues, UInt8Codec, uIntBitValues } from ".";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const uInt8Codec = new UInt8Codec();
const uInt8: CodecType<typeof uInt8Codec> = 2 ** 8 - 1;

createBenchmark("UInt8", uInt8, uInt8Codec);

for (const endianness of endiannessValues) {
	for (const bits of uIntBitValues) {
		if (bits === 8) continue;

		const codec = createUIntCodec(bits, endianness);
		const value: CodecType<typeof codec> = 2 ** bits - 1;

		createBenchmark(`UInt${bits}${endianness}`, value, codec);
	}
}
