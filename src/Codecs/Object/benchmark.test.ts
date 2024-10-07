import { randomBytes } from "crypto";
import { ObjectCodec } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";
import { StringVariableCodec } from "../String/Variable";
import { VarInt60Codec } from "../VarInt/VarInt60";

const codec = new ObjectCodec({
	string: new StringVariableCodec("hex"),
	number: new VarInt60Codec(),
	boolean: new BooleanCodec(),
});
const value: CodecType<typeof codec> = {
	string: randomBytes(16).toString("hex"),
	number: 256,
	boolean: true,
};

it(
	"encode benchmarks for objectFixed codec",
	async () => {
		await encodeBenchmark("objectFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for objectFixed codec",
	async () => {
		await decodeBenchmark("objectFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for objectFixed codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
