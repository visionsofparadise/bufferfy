import { BitFieldCodec } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";

const codec = new BitFieldCodec(["test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9"]);
const value: CodecType<typeof codec> = {
	test1: true,
	test2: false,
	test3: true,
	test4: true,
	test5: false,
	test6: true,
	test7: true,
	test8: false,
	test9: true,
};

it(
	"encode benchmarks for boolean codec",
	async () => {
		await encodeBenchmark("boolean", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for boolean codec",
	async () => {
		await decodeBenchmark("boolean", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for boolean codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
