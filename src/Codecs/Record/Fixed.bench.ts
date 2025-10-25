import { randomBytes } from "crypto";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { RecordFixedCodec } from "./Fixed";

const codec = new RecordFixedCodec(100, new StringFixedCodec(4, "hex"), new StringFixedCodec(16, "hex"));
const entries = Array(100)
	.fill(undefined)
	.map(() => [randomBytes(4).toString("hex"), randomBytes(16).toString("hex")]);
const value: CodecType<typeof codec> = Object.fromEntries(entries);

createBenchmark("RecordFixed", value, codec);
