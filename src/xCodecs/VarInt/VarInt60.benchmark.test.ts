import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { VarInt60Codec } from "./VarInt60";

const codec = new VarInt60Codec();
const value: CodecType<typeof codec> = 2 ** 48 - 1;

it(
	"encode benchmarks for varInt60 codec",
	async () => {
		await encodeBenchmark("varInt60", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for varInt60 codec",
	async () => {
		await decodeBenchmark("varInt60", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for varInt60 codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
