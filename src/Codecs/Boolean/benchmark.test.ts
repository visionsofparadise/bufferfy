import { BooleanCodec } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";

const value = true;
const codec = new BooleanCodec();

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
