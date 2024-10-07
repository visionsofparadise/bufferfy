import { ConstantCodec } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";

const value = null;
const codec = new ConstantCodec(value);

it(
	"encode benchmarks for constant codec",
	async () => {
		await encodeBenchmark("constant", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for constant codec",
	async () => {
		await decodeBenchmark("constant", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for constant codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
