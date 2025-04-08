import { AbstractCodec, CodecType } from "./Codecs/Abstract";
import { createAnyCodec } from "./Codecs/Any";
import { createArrayCodec } from "./Codecs/Array";
import { createBitFieldCodec } from "./Codecs/BitField";
import { createBooleanCodec } from "./Codecs/Boolean";
import { createBytesCodec } from "./Codecs/Bytes";
import { createConstantCodec } from "./Codecs/Constant";
import { createFloatCodec } from "./Codecs/Float";
import { createIntCodec } from "./Codecs/Int";
import { createObjectCodec } from "./Codecs/Object";
import { mergeObjectCodecs } from "./Codecs/Object/Merge";
import { omitObjectCodec } from "./Codecs/Object/Omit";
import { pickObjectCodec } from "./Codecs/Object/Pick";
import { createRecordCodec } from "./Codecs/Record";
import { createRecursiveCodec } from "./Codecs/Recursive";
import { createStringCodec } from "./Codecs/String";
import { createTransformCodec } from "./Codecs/Transform";
import { createTupleCodec } from "./Codecs/Tuple";
import { createUIntCodec } from "./Codecs/UInt";
import { createUnionCodec } from "./Codecs/Union";
import { createVarIntCodec } from "./Codecs/VarInt";

export namespace Codec {
	export type Type<Codec extends AbstractCodec<any>> = CodecType<Codec>;
}

export const Codec = {
	Any: createAnyCodec,
	Array: createArrayCodec,
	BitField: createBitFieldCodec,
	Boolean: createBooleanCodec(),
	Bytes: createBytesCodec,
	Constant: createConstantCodec,
	Enum: <const Value>(enumValues: Array<Value>, indexCodec: AbstractCodec<number>) =>
		createUnionCodec(
			enumValues.map((value) => createConstantCodec(value)),
			indexCodec
		),
	False: createConstantCodec(false),
	Float: createFloatCodec,
	Int: createIntCodec,
	Merge: mergeObjectCodecs,
	Null: createConstantCodec(null),
	Nullable: <Value>(codec: AbstractCodec<Value>) => createUnionCodec([codec, createConstantCodec(null)]),
	Object: createObjectCodec,
	Omit: omitObjectCodec,
	Optional: <Value>(codec: AbstractCodec<Value>) => createUnionCodec([codec, createConstantCodec(undefined)]),
	Pick: pickObjectCodec,
	Record: createRecordCodec,
	Recursive: createRecursiveCodec,
	String: createStringCodec,
	Transform: createTransformCodec,
	True: createConstantCodec(true),
	Tuple: createTupleCodec,
	UInt: createUIntCodec,
	Undefined: createConstantCodec(undefined),
	Union: createUnionCodec,
	VarInt: createVarIntCodec,
};
