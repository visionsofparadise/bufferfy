import { randomBytes } from "crypto";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "./Fixed";

const codec = new StringFixedCodec(1024);
const value: CodecType<typeof codec> = randomBytes(1024).toString();

createBenchmark("StringFixed", value, codec);
