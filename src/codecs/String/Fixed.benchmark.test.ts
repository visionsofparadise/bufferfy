import { randomBytes } from "crypto";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "./Fixed";

const codec = new StringFixedCodec(1024);
const value: CodecType<typeof codec> = randomBytes(1024).toString();

it(
	"encode benchmarks for stringFixed codec",
	async () => {
		await encodeBenchmark("stringFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for stringFixed codec",
	async () => {
		await decodeBenchmark("stringFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for stringFixed codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
