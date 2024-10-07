import { AbstractCodec, CodecType } from "./xCodecs/Abstract";
import { createAnyCodec } from "./xCodecs/Any";
import { createArrayCodec } from "./xCodecs/Array";
import { createBitFieldCodec } from "./xCodecs/BitField";
import { createBooleanCodec } from "./xCodecs/Boolean";
import { createBufferCodec } from "./xCodecs/Buffer";
import { createConstantCodec } from "./xCodecs/Constant";
import { createFloatCodec } from "./xCodecs/Float";
import { createIntCodec } from "./xCodecs/Int";
import { createObjectCodec } from "./xCodecs/Object";
import { mergeObjectCodecs } from "./xCodecs/Object/Merge";
import { omitObjectCodec } from "./xCodecs/Object/Omit";
import { pickObjectCodec } from "./xCodecs/Object/Pick";
import { createRecordCodec } from "./xCodecs/Record";
import { createStringCodec } from "./xCodecs/String";
import { createTransformCodec } from "./xCodecs/Transform";
import { createTupleCodec } from "./xCodecs/Tuple";
import { createUIntCodec } from "./xCodecs/UInt";
import { createUnionCodec } from "./xCodecs/Union";
import { createVarIntCodec } from "./xCodecs/VarInt";

export namespace Codec {
	export type Type<Codec extends AbstractCodec<any>> = CodecType<Codec>;
}

export const Codec = {
	Any: createAnyCodec,
	Array: createArrayCodec,
	BitField: createBitFieldCodec,
	Boolean: createBooleanCodec(),
	Buffer: createBufferCodec,
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
	String: createStringCodec,
	Transform: createTransformCodec,
	True: createConstantCodec(true),
	Tuple: createTupleCodec,
	UInt: createUIntCodec,
	Undefined: createConstantCodec(undefined),
	Union: createUnionCodec,
	VarInt: createVarIntCodec,
};
