import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { VarInt30Codec } from "./VarInt30";

const codec = new VarInt30Codec();
const value: CodecType<typeof codec> = 2 ** 30 - 1;

it(
	"encode benchmarks for varInt30 codec",
	async () => {
		await encodeBenchmark("varInt30", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for varInt30 codec",
	async () => {
		await decodeBenchmark("varInt30", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for varInt30 codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
