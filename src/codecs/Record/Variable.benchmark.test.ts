import { randomBytes } from "crypto";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { RecordVariableCodec } from "./Variable";

const codec = new RecordVariableCodec(new StringFixedCodec(4, "hex"), new StringFixedCodec(16, "hex"));
const entries = Array(1000)
	.fill(undefined)
	.map(() => [randomBytes(4).toString("hex"), randomBytes(16).toString("hex")]);
const value: CodecType<typeof codec> = Object.fromEntries(entries);

it(
	"encode benchmarks for recordVariable codec",
	async () => {
		await encodeBenchmark("recordVariable", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for recordVariable codec",
	async () => {
		await decodeBenchmark("recordVariable", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for recordVariable codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
