import { randomBytes } from "crypto";
import { UnionCodec } from ".";
import { decodeBenchmark, encodeBenchmark, sizeBenchmark } from "../../utilities/benchmark.ignore";
import { CodecType } from "../Abstract";
import { ConstantCodec } from "../Constant";
import { StringFixedCodec } from "../String/Fixed";

const codec = new UnionCodec([new StringFixedCodec(32, "hex"), new ConstantCodec(undefined)]);
const value: CodecType<typeof codec> = randomBytes(16).toString("hex");

it(
	"encode benchmarks for union codec",
	async () => {
		await encodeBenchmark("union", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"decode benchmarks for union codec",
	async () => {
		await decodeBenchmark("union", value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);

it(
	"size benchmarks for union codec",
	async () => {
		await sizeBenchmark(value, codec);

		expect(true).toBeTruthy();
	},
	5 * 60 * 1000
);
