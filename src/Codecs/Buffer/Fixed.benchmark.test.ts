import { randomBytes } from "crypto";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { BufferFixedCodec } from "./Fixed";

const codec = new BufferFixedCodec(1024);
const value: CodecType<typeof codec> = randomBytes(1024);

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
