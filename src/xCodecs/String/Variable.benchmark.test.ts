import { randomBytes } from "crypto";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { StringVariableCodec } from "./Variable";

const codec = new StringVariableCodec();
const value: CodecType<typeof codec> = randomBytes(1024).toString();

it(
	"encode benchmarks for stringVariable codec",
	async () => {
		await encodeBenchmark("stringVariable", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for stringVariable codec",
	async () => {
		await decodeBenchmark("stringVariable", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for stringVariable codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
