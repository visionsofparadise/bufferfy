import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "./utilities/benchmark.ignore";
import { CommonCodec, commonValue, SpreadCodec, spreadValue } from "./utilities/TestValues.ignore";

it(
	"encode benchmarks for spread codec",
	async () => {
		await encodeBenchmark("spread", spreadValue, SpreadCodec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for spread codec",
	async () => {
		await decodeBenchmark("spread", spreadValue, SpreadCodec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for spread codec",
	async () => {
		await sizeBenchmark(spreadValue, SpreadCodec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"encode benchmarks for common codec",
	async () => {
		await encodeBenchmark("common", commonValue, CommonCodec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for common codec",
	async () => {
		await decodeBenchmark("common", commonValue, CommonCodec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for common codec",
	async () => {
		await sizeBenchmark(commonValue, CommonCodec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
