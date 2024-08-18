import { createAnyCodec } from "./codecs/Any";
import { createArrayCodec } from "./codecs/Array";
import { createBitFieldCodec } from "./codecs/BitField";
import { createBooleanCodec } from "./codecs/Boolean";
import { createBufferCodec } from "./codecs/Buffer";
import { createConstantCodec } from "./codecs/Constant";
import { createEnumCodec } from "./codecs/Enum";
import { createFloatCodec } from "./codecs/Float";
import { createIntCodec } from "./codecs/Int";
import { createNullCodec } from "./codecs/Null";
import { createObjectCodec } from "./codecs/Object";
import { createOptionalCodec } from "./codecs/Optional";
import { createPointerCodec } from "./codecs/Pointer";
import { createRecordCodec } from "./codecs/Record";
import { createStringCodec } from "./codecs/String";
import { createSwitchCodec } from "./codecs/Switch";
import { createTransformCodec } from "./codecs/Transform";
import { createTupleCodec } from "./codecs/Tuple";
import { createUIntCodec } from "./codecs/UInt";
import { createUndefinedCodec } from "./codecs/Undefined";
import { createUnionCodec } from "./codecs/Union";
import { createVarUIntCodec } from "./codecs/VarUInt";

/**
 * Creates a codec for any or custom values. By default uses JSON.stringify and JSON.parse.
 *
 * Serializes to ```[LENGTH][VALUE]```
 *
 * @param	{AnyCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @param	{(value) => Buffer} [options.encode] - Sets a custom encoder.
 * @param	{(buffer) => Value} [options.decode] - Sets a custom decoder.
 * @param	{UIntCodec | VarUIntCodec} [options.lengthCodec="VarUInt()"] - Codec to specify how the length is encoded.
 * @return	{AnyCodec} AnyCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Any/index.ts|Source}
 */
export const Any = createAnyCodec;

/**
 * Creates a codec for fixed or variable length arrays.
 *
 * Serializes to ```[LENGTH?][...ITEMS]```
 *
 * Length is present only for variable length arrays.
 *
 * @param	{AbstractCodec} itemCodec - The codec for each item in the array.
 * @param	{ArrayCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @param	{number} [options.length] - Sets a fixed length.
 * @param	{PointerCodec<number>} [options.lengthPointer] - Pointer to specify where the length value can be found.
 * @param	{UIntCodec | VarUIntCodec} [options.lengthCodec="VarUInt()"] - Codec to specify how the length is encoded.
 * @return	{ArrayCodec} ArrayCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Array/index.ts|Source}
 */
export const Array = createArrayCodec;

/**
 * Creates a codec for boolean flags packed into bits of a byte.
 *
 * Serializes to ```[...FLAG_BYTES]```
 *
 * Packs up to 8 boolean values associated with the given keys, into each byte.
 *
 * @param	{Array<string>} keys - Keys for each boolean flag.
 * @param	{BitFieldCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{BitFieldCodec} BitFieldCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/BitField/index.ts|Source}
 */
export const BitField = createBitFieldCodec;

/**
 * Creates a codec for a boolean byte
 *
 * Serializes to ```[0 or 1]```
 *
 * @param	{BooleanCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{BooleanCodec} BooleanCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Boolean/index.ts|Source}
 */
export const Boolean = createBooleanCodec;

/**
 * Creates a codec for a fixed or variable length buffer.
 *
 * Serializes to ```[LENGTH?][BUFFER]```
 *
 * Length is present only for variable length buffers.
 *
 * @param	{BufferCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @param	{number} [options.length] - Sets a fixed length.
 * @param	{PointerCodec<number>} [options.lengthPointer] - Pointer to specify where the length value can be found.
 * @param	{UIntCodec | VarUIntCodec} [options.lengthCodec="VarUInt()"] - Codec to specify how the length is encoded.
 * @return	{BufferCodec} BufferCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Buffer/index.ts|Source}
 */
export const Buffer = createBufferCodec;

/**
 * Creates a codec for a constant.
 *
 * Serializes to ```N/A```
 *
 * No bytes are serialized.
 *
 * @param	{any} value - Value of the constant.
 * @param	{ConstantCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{ConstantCodec} ConstantCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Constant/index.ts|Source}
 */
export const Constant = createConstantCodec;

/**
 * Creates a codec for enumerated values.
 *
 * Serializes to ```[INDEX]```
 *
 * Serializes the index that references the value in the array of enumerated values.
 *
 * @param	{Array<any>} values - Array of enumerated values.
 * @param	{EnumCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @param	{UIntCodec | VarUIntCodec} [options.indexCodec="VarUInt()"] - Codec for the index value.
 * @return	{EnumCodec} EnumCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Enum/index.ts|Source}
 */
export const Enum = createEnumCodec;

/**
 * Creates a codec for a float or double.
 *
 * Serializes to ```[FLOAT]```
 *
 * @param	{32 | 64} [bits=32] - Bit type of float.
 * @param	{'LE' | 'BE'} [endianness=os.endianness()] - Endianness
 * @param	{FloatCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{FloatCodec} FloatCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Float/index.ts|Source}
 */
export const Float = createFloatCodec;

/**
 * Creates a codec for a signed integer.
 *
 * Serializes to ```[INT]```
 *
 * @param	{8 | 16 | 24 | 32 | 40 | 48} [bits=48] - Bit type of integer.
 * @param	{'LE' | 'BE'} [endianness=os.endianness()] - Endianness
 * @param	{IntCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{IntCodec} IntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Int/index.ts|Source}
 */
export const Int = createIntCodec;

/**
 * Creates a codec for null value.
 *
 * Serializes to ```N/A```
 *
 * No bytes are serialized.
 *
 * @param	{NullCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{NullCodec} NullCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Null/index.ts|Source}
 */
export const Null = createNullCodec;

/**
 * Creates a codec for an object.
 *
 * Serializes to ```[...PROPERTY_VALUES]```
 *
 * Serializes each property value with the codec associated with that key.
 *
 * @param	{Record<PropertyKey, AbstractCodec>} properties - Properties of the object.
 * @param	{ObjectCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{ObjectCodec} ObjectCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Object/index.ts|Source}
 */
export const Object = createObjectCodec;

/**
 * Creates a codec for an optional object property.
 *
 * Serializes to ```[IS_DEFINED][VALUE?]```
 *
 * A boolean byte for if the value is defined or not. The value if it is defined.
 *
 * @param	{AbstractCodec} codec - Codec for the value if it is defined.
 * @param	{OptionalCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{OptionalCodec} OptionalCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Optional/index.ts|Source}
 */
export const Optional = createOptionalCodec;

/**
 * Creates a codec that becomes the codec/value referenced by targetId. Can be used for recursion or reference a length integer elsewhere in the buffer.
 *
 * Serializes to ```[TARGET_VALUE]```
 *
 * @param	{string} targetId - Id of the target codec/value.
 * @return	{PointerCodec} PointerCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Pointer/index.ts|Source}
 */
export const Pointer = createPointerCodec;

/**
 * Creates a codec for a record or map of keys and values.
 *
 * Serializes to ```[LENGTH?][...[KEY][VALUE]]```
 *
 * Length is present only for variable length records.
 *
 * @param	{AbstractCodec} keyCodec - Codec for keys.
 * @param	{AbstractCodec} valueCodec - Codec for values.
 * @param	{RecordCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @param	{number} [options.length] - Sets a fixed length.
 * @param	{PointerCodec<number>} [options.lengthPointer] - Pointer to specify where the length value can be found.
 * @param	{UIntCodec | VarUIntCodec} [options.lengthCodec="VarUInt()"] - Codec to specify how the length is encoded.
 * @return	{RecordCodec} RecordCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Record/index.ts|Source}
 */
export const Record = createRecordCodec;

/**
 * Creates a codec for a fixed or variable length string.
 *
 * Serializes to ```[LENGTH?][STRING]```
 *
 * Length is present only for variable length strings.
 *
 * @param	{StringCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @param	{BufferEncoding} [options.encoding="utf8"] - The strings encoding.
 * @param	{number} [options.length] - Sets a fixed length.
 * @param	{PointerCodec<number>} [options.lengthPointer] - Pointer to specify where the length value can be found.
 * @param	{UIntCodec | VarUIntCodec} [options.lengthCodec="VarUInt()"] - Codec to specify how the length is encoded.
 * @return	{StringCodec} StringCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/String/index.ts|Source}
 */
export const String = createStringCodec;

/**
 * Creates a set of codecs where the codec used is selected based on conditions from the value or buffer provided. A default codec can be set for unmatched values/buffers. An example of where this can be useful is for an object with many different versions.
 *
 * Serializes to ```[VALUE]```
 *
 * @param	{Array<AbstractCodec>} codecMap - An map of keys and codecs where keys are case values for the switch.
 * @param	{SwitchCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @param	{(value) => PropertyKey} [options.getValueCase] - A function that takes a value and returns a key of the codecMap, selecting the appropriate codec.
 * @param	{(buffer) => PropertyKey} [options.getBufferCase] - A function that takes a buffer and returns a key of the codecMap, selecting the appropriate codec.
 * @param	{PropertyKey} [options.default] - The key of the codecMap that selects the codec used for unmatched values/buffers.
 * @return	{SwitchCodec} SwitchCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Switch/index.ts|Source}
 */
export const Switch = createSwitchCodec;

/**
 * Creates a codec wrapper that transforms from source type to target type
 *
 * Serializes to ```[VALUE]```
 *
 * Uses the wrapped codecs serialization.
 *
 * @param	{AbstractCodec} targetCodec - The wrapped codec.
 * @param	{TransformCodecOptions} options
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @param	{(source) => target} options.encode - Function that transforms from source to target.
 * @param	{(target, buffer) => source} options.decode - Function that transforms from target to source.
 * @return	{TransformCodec} TransformCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Transform/index.ts|Source}
 */
export const Transform = createTransformCodec;

/**
 * Creates a codec for a tuple of values.
 *
 * Serializes to ```[...ITEMS]```
 *
 * @param	{Array<AbstractCodec>}	codecs - A series of codecs for each value of the tuple.
 * @param	{TupleCodecOptions} options
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{TupleCodec} TupleCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Tuple/index.ts|Source}
 */
export const Tuple = createTupleCodec;

/**
 * Creates a codec for a unsigned integer.
 *
 * Serializes to ```[UINT]```
 *
 * @param	{8 | 16 | 24 | 32 | 40 | 48} [bits=48] - Bit type of integer.
 * @param	{'LE' | 'BE'} [endianness=os.endianness()] - Endianness
 * @param	{UIntCodecOptions} options
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{UIntCodec} UIntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/UInt/index.ts|Source}
 */
export const UInt = createUIntCodec;

/**
 * Creates a codec for undefined value.
 *
 * Serializes to ```N/A```
 *
 * Uses the undefined value in the codec, no bytes are serialized.
 *
 * @param	{UndefinedCodecOptions} options
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{UndefinedCodec} UndefinedCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Undefined/index.ts|Source}
 */
export const Undefined = createUndefinedCodec;

/**
 * Creates a codec for one of many types of value. Each codec type has a match method that returns true if the input value type matches the codec's type. The union codec iterates through codecs until a codec matches and then uses that codec. Some examples of when the union codec can be useful are:
 *
 * - Optional or nullable values.
 * - Overloaded values.
 *
 * Serializes to ```[CODEC_INDEX][VALUE]```
 *
 * @param	{Array<AbstractCodec>} codecs - An array of codecs for possible value types.
 * @param	{UnionCodecOptions} [options]
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @param 	{UIntCodec | VarUIntCodec} [options.indexCodec="VarUInt()"] - Codec for the index value.
 * @return	{UnionCodec} UnionCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/Union/index.ts|Source}
 */
export const Union = createUnionCodec;

/**
 * Creates a codec for a variable length unsigned integer. Follows Bitcoin's VarInt specification but is limited to 6 byte safe integers.
 *
 * Serializes to ```[UINT & LENGTH][...UINT_REST?]```
 *
 * - 0 <= value <= 252: 1 byte
 * - 253 <= value <= 65535: 3 bytes
 * - 65536 <= value <= 4294967295: 5 bytes
 * - 4294967296 <= 281474976710655 <= 252: 7 bytes
 *
 * @param	{'LE' | 'BE'} [endianness=os.endianness()] - Endianness
 * @param	{VarUIntCodecOptions} options
 * @param	{string} [options.id] - Sets an id that can be pointed to.
 * @return	{VarUIntCodec} VarUIntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/codecs/VarUInt/index.ts|Source}
 */
export const VarUInt = createVarUIntCodec;
