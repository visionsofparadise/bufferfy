import { randomBytes } from "crypto";
import { UnionCodec } from ".";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { ConstantCodec } from "../Constant";
import { StringFixedCodec } from "../String/Fixed";

const codec = new UnionCodec([new StringFixedCodec(32, "hex"), new ConstantCodec(undefined)]);
const value: CodecType<typeof codec> = randomBytes(16).toString("hex");

createBenchmark("Union", value, codec);
