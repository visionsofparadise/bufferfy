import { createBigUIntCodec } from ".";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { endiannessValues } from "../UInt";

for (const endianness of endiannessValues) {
	const codec = createBigUIntCodec(endianness);
	const value: CodecType<typeof codec> = BigInt(512);

	createBenchmark(`BigUInt${endianness}`, value, codec);
}
