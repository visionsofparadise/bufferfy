import { randomBytes } from "crypto";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { StringVariableCodec } from "./Variable";

const codec = new StringVariableCodec();
const value: CodecType<typeof codec> = randomBytes(1024).toString();

createBenchmark("StringVariable", value, codec);
