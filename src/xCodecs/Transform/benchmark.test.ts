import { TransformCodec } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";

const codec = new TransformCodec(new BooleanCodec(), {
	decode: (boolean) => {
		if (boolean === true) return 1;
		if (boolean === false) return 0;

		throw new Error("Invalid value");
	},
	encode: (value) => {
		if (value !== 1 && value !== 0) throw new Error("Invalid value");

		return value === 1;
	},
});
const value: CodecType<typeof codec> = 1;

it(
	"encode benchmarks for transform codec",
	async () => {
		await encodeBenchmark("transform", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for transform codec",
	async () => {
		await decodeBenchmark("transform", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for transform codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
