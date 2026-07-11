import { randomBytes } from "crypto";
import { UnionCodec } from ".";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { ConstantCodec } from "../Constant";
import { ObjectCodec } from "../Object";
import { StringFixedCodec } from "../String/Fixed";
import { StringVariableCodec } from "../String/Variable";
import { UInt8Codec } from "../UInt";
import { VarInt15Codec } from "../VarInt/VarInt15";

const codec = new UnionCodec([new StringFixedCodec(32, "hex"), new ConstantCodec(undefined)]);
const value: CodecType<typeof codec> = randomBytes(16).toString("hex");

createBenchmark("Union", value, codec);

// Object-branch union: a non-exact object matcher followed by Null. Exercises the encode-selection path the
// exact string/undefined union above cannot (the spike union-workload shape).
const objectCodec = new UnionCodec([new ObjectCodec({ a: new UInt8Codec(), b: new StringVariableCodec("utf8", new VarInt15Codec()) }), new ConstantCodec(null)], new UInt8Codec());
const objectValue: CodecType<typeof objectCodec> = { a: 42, b: "item42" };

createBenchmark("UnionObject", objectValue, objectCodec);
