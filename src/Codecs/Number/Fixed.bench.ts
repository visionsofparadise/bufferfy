import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { NumberFixedCodec } from "./Fixed";

const codec = new NumberFixedCodec(32);
const value: CodecType<typeof codec> = BigInt(100);

createBenchmark("NumberFixed", value, codec);
