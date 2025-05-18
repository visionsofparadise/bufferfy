import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { BytesConstantCodec } from "./Constant";

const value = new Uint8Array(16).fill(0);
const codec = new BytesConstantCodec(value);

it(
	"encode benchmarks for bufferFixed codec",
	async () => {
		await encodeBenchmark("bufferFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for bufferFixed codec",
	async () => {
		await decodeBenchmark("bufferFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for bufferFixed codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
