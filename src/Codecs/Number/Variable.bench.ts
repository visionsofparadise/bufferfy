import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { NumberVariableCodec } from "./Variable";

const codec = new NumberVariableCodec();
const value: CodecType<typeof codec> = BigInt(100);

createBenchmark("NumberVariable", value, codec);
