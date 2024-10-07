import { randomBytes } from "crypto";
import { TupleCodec } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";
import { StringFixedCodec } from "../String/Fixed";
import { VarInt60Codec } from "../VarInt/VarInt60";

const codec = new TupleCodec([new StringFixedCodec(32, "hex"), new VarInt60Codec(), new BooleanCodec()]);
const value: CodecType<typeof codec> = [randomBytes(16).toString("hex"), 256, true];

it(
	"encode benchmarks for tuple codec",
	async () => {
		await encodeBenchmark("tuple", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for tuple codec",
	async () => {
		await decodeBenchmark("tuple", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for tuple codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
