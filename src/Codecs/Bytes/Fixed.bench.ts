import { randomBytes } from "crypto";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { BytesFixedCodec } from "./Fixed";

const codec = new BytesFixedCodec(1024);
const value: CodecType<typeof codec> = randomBytes(1024);

createBenchmark("BytesFixed", value, codec);
