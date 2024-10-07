import { randomBytes } from "crypto";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { RecordFixedCodec } from "./Fixed";

const codec = new RecordFixedCodec(100, new StringFixedCodec(4, "hex"), new StringFixedCodec(16, "hex"));
const entries = Array(100)
	.fill(undefined)
	.map(() => [randomBytes(4).toString("hex"), randomBytes(16).toString("hex")]);
const value: CodecType<typeof codec> = Object.fromEntries(entries);

it(
	"encode benchmarks for recordFixed codec",
	async () => {
		await encodeBenchmark("recordFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for recordFixed codec",
	async () => {
		await decodeBenchmark("recordFixed", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for recordFixed codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
