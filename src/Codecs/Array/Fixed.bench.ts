import { randomBytes } from "crypto";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { ArrayFixedCodec } from "./Fixed";

const codec = new ArrayFixedCodec(100, new StringFixedCodec(16, "hex"));
const value: CodecType<typeof codec> = Array(100)
	.fill(undefined)
	.map(() => randomBytes(16).toString("hex"));

createBenchmark("ArrayFixed", value, codec);
