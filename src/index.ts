export { AbstractCodec } from "./codecs/Abstract";
export { AnyCodec } from "./codecs/Any";
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
export { SwitchCodec } from "./codecs/Switch";
export { TransformCodec } from "./codecs/Transform";
export { TupleCodec } from "./codecs/Tuple";
export { UIntCodec } from "./codecs/UInt";
export { UndefinedCodec } from "./codecs/Undefined";
export { UnionCodec } from "./codecs/Union";
export { VarUIntCodec } from "./codecs/VarUInt";

import { Any, Array, BitField, Boolean, Buffer, Constant, Enum, Float, Int, Null, Object, Optional, Pointer, Record, String, Switch, Transform, Tuple, UInt, Undefined, Union, VarUInt } from "./Codec";
import { AbstractCodec, CodecType } from "./codecs/Abstract";

export namespace Codec {
	export type Type<Codec extends AbstractCodec<any>> = CodecType<Codec>;
}

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
	Switch,
	Transform,
	Tuple,
	UInt,
	Undefined,
	Union,
	VarUInt,
};
