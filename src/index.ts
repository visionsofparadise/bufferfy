export { AbstractCodec } from "./codecs/Abstract";
export { ArrayCodec } from "./codecs/Array";
export { BitFieldCodec } from "./codecs/BitField";
export { BooleanCodec } from "./codecs/Boolean";
export { BufferCodec } from "./codecs/Buffer";
export { ConstantCodec } from "./codecs/Constant";
export { EnumCodec } from "./codecs/Enum";
export { FloatCodec } from "./codecs/Float";
export { IntCodec } from "./codecs/Int";
export { NullCodec } from "./codecs/Null";
export { ObjectCodec } from "./codecs/Object";
export { OptionalCodec } from "./codecs/Optional";
export { PointerCodec } from "./codecs/Pointer";
export { RecordCodec } from "./codecs/Record";
export { StringCodec } from "./codecs/String";
export { TransformCodec } from "./codecs/Transform";
export { TupleCodec } from "./codecs/Tuple";
export { UIntCodec } from "./codecs/UInt";
export { UndefinedCodec } from "./codecs/Undefined";
export { UnionCodec } from "./codecs/Union";

import { Any, Array, BitField, Boolean, Buffer, Constant, Enum, Float, Int, Null, Object, Optional, Pointer, Record, String, Transform, Tuple, UInt, Undefined, Union } from "./Codec";

export const Codec = {
	Any,
	Array,
	BitField,
	Boolean,
	Buffer,
	Constant,
	Enum,
	Float,
	Int,
	Null,
	Object,
	Optional,
	Pointer,
	Record,
	String,
	Transform,
	Tuple,
	UInt,
	Undefined,
	Union,
};
