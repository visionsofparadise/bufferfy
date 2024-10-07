import { randomBytes } from "crypto";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { ArrayFixedCodec } from "./Fixed";

const codec = new ArrayFixedCodec(100, new StringFixedCodec(16, "hex"));
const value: CodecType<typeof codec> = Array(100)
	.fill(undefined)
	.map(() => randomBytes(16).toString("hex"));

it(
	"encode benchmarks for arrayFixed codec",
	async () => {
		await encodeBenchmark("arrayFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for arrayFixed codec",
	async () => {
		await decodeBenchmark("arrayFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for arrayFixed codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
