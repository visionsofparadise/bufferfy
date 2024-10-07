import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { VarInt15Codec } from "./VarInt15";

const codec = new VarInt15Codec();
const value: CodecType<typeof codec> = 2 ** 15 - 1;

it(
	"encode benchmarks for varInt15 codec",
	async () => {
		await encodeBenchmark("varInt15", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for varInt15 codec",
	async () => {
		await decodeBenchmark("varInt15", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for varInt15 codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
