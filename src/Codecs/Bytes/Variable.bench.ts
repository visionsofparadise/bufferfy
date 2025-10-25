import { randomBytes } from "crypto";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { BytesVariableCodec } from "./Variable";

const codec = new BytesVariableCodec();
const value: CodecType<typeof codec> = randomBytes(1024);

createBenchmark("BytesVariable", value, codec);
