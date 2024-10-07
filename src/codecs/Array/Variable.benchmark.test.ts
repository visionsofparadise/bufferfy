import { randomBytes } from "crypto";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { ArrayVariableCodec } from "./Variable";

const codec = new ArrayVariableCodec(new StringFixedCodec(16, "hex"));
const value: CodecType<typeof codec> = Array(1000)
	.fill(undefined)
	.map(() => randomBytes(16).toString("hex"));

it(
	"encode benchmarks for arrayVariable codec",
	async () => {
		await encodeBenchmark("arrayVariable", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for arrayVariable codec",
	async () => {
		await decodeBenchmark("arrayVariable", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for arrayVariable codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
