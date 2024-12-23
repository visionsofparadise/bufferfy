import { randomBytes } from "crypto";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { BytesVariableCodec } from "./Variable";

const codec = new BytesVariableCodec();
const value: CodecType<typeof codec> = randomBytes(1024);

it(
	"encode benchmarks for bufferVariable codec",
	async () => {
		await encodeBenchmark("bufferVariable", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for bufferVariable codec",
	async () => {
		await decodeBenchmark("bufferVariable", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for bufferVariable codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
