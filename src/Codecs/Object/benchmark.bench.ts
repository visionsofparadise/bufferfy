import { randomBytes } from "crypto";
import { ObjectCodec } from ".";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";
import { StringVariableCodec } from "../String/Variable";
import { VarInt60Codec } from "../VarInt/VarInt60";

const codec = new ObjectCodec({
	string: new StringVariableCodec("hex"),
	number: new VarInt60Codec(),
	boolean: new BooleanCodec(),
});

const value: CodecType<typeof codec> = {
	string: randomBytes(16).toString("hex"),
	number: 256,
	boolean: true,
};

createBenchmark("Object", value, codec);
