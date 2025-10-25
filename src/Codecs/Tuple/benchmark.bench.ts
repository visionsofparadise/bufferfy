import { randomBytes } from "crypto";
import { TupleCodec } from ".";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";
import { StringFixedCodec } from "../String/Fixed";
import { VarInt60Codec } from "../VarInt/VarInt60";

const codec = new TupleCodec([new StringFixedCodec(32, "hex"), new VarInt60Codec(), new BooleanCodec()]);
const value: CodecType<typeof codec> = [randomBytes(16).toString("hex"), 256, true];

createBenchmark("Tuple", value, codec);
