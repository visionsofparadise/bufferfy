import { randomBytes } from "crypto";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { ArrayVariableCodec } from "./Variable";

const codec = new ArrayVariableCodec(new StringFixedCodec(16, "hex"));
const value: CodecType<typeof codec> = Array(100)
	.fill(undefined)
	.map(() => randomBytes(16).toString("hex"));

createBenchmark("ArrayVariable", value, codec);
