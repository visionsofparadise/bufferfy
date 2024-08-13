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
import { createTransformCodec } from "./codecs/Transform";
import { createTupleCodec } from "./codecs/Tuple";
import { createUIntCodec } from "./codecs/UInt";
import { createUndefinedCodec } from "./codecs/Undefined";
import { createUnionCodec } from "./codecs/Union";

/**
 * Creates a codec for any or custom values. By default uses JSON.stringify and JSON.parse.
 *
 * Serializes to ```[LENGTH][VALUE]```
 *
 * @param	{AnyCodecOptions} [options]
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @param	{(value) => Buffer} [options.encode] - Sets a custom encoder.
 * @param	{(buffer) => Value} [options.decode] - Sets a custom decoder.
 * @param	{UIntCodec} [options.lengthCodec="UInt(48)"] - Codec to specify how the length is encoded.
 * @return	{AnyCodec} AnyCodec
 *
 * ---
 *
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @param	{number} [options.length] - Sets a fixed length.
 * @param	{PointerCodec<number>} [options.lengthPointer] - Pointer to specify where the length value can be found.
 * @param	{UIntCodec} [options.lengthCodec="UInt(48)"] - Codec to specify how the length is encoded.
 * @return	{ArrayCodec} ArrayCodec
 *
 * ---
 *
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{BitFieldCodec} BitFieldCodec
 */
export const BitField = createBitFieldCodec;

/**
 * Creates a codec for a boolean byte
 *
 * Serializes to ```[0 or 1]```
 *
 * @param	{BooleanCodecOptions} [options]
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{BooleanCodec} BooleanCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @param	{number} [options.length] - Sets a fixed length.
 * @param	{PointerCodec<number>} [options.lengthPointer] - Pointer to specify where the length value can be found.
 * @param	{UIntCodec} [options.lengthCodec="UInt(48)"] - Codec to specify how the length is encoded.
 * @return	{BufferCodec} BufferCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{ConstantCodec} ConstantCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @param	{UIntCodec} [options.indexCodec="UInt(48)"] - Codec for the index value.
 * @return	{EnumCodec} EnumCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{FloatCodec} FloatCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{IntCodec} IntCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{NullCodec} NullCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{ObjectCodec} ObjectCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{OptionalCodec} OptionalCodec
 */
export const Optional = createOptionalCodec;

/**
 * Creates a codec that becomes the codec/value referenced by targetId. Can be used for recursion or reference a length integer elsewhere in the buffer.
 *
 * Serializes to ```[TARGET_VALUE]```
 *
 * @param	{string} targetId - Id of the target codec/value.
 * @return	{PointerCodec} PointerCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @param	{number} [options.length] - Sets a fixed length.
 * @param	{PointerCodec<number>} [options.lengthPointer] - Pointer to specify where the length value can be found.
 * @param	{UIntCodec} [options.lengthCodec="UInt(48)"] - Codec to specify how the length is encoded.
 * @return	{RecordCodec} RecordCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @param	{BufferEncoding} [options.encoding="utf8"] - The strings encoding.
 * @param	{number} [options.length] - Sets a fixed length.
 * @param	{PointerCodec<number>} [options.lengthPointer] - Pointer to specify where the length value can be found.
 * @param	{UIntCodec} [options.lengthCodec="UInt(48)"] - Codec to specify how the length is encoded.
 * @return	{StringCodec} StringCodec
 */
export const String = createStringCodec;

/**
 * Creates a codec wrapper that transforms a value when serializing and deserializing.
 *
 * Serializes to ```[VALUE]```
 *
 * Uses the wrapped codecs serialization.
 *
 * @param	{AbstractCodec} codec - The wrapped codec.
 * @param	{TransformCodecOptions} options
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @param	{Function} options.transform - Function that transforms the value into the wrapped codecs expected value.
 * @param	{Function} options.untransform - Function that transforms the wrapped codecs value into the expected value.
 * @return	{TransformCodec} TransformCodec
 */
export const Transform = createTransformCodec;

/**
 * Creates a codec for a tuple of values.
 *
 * Serializes to ```[...ITEMS]```
 *
 * @param	{Array<AbstractCodec>}	codecs - A series of codecs for each value of the tuple.
 * @param	{TupleCodecOptions} options
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{TupleCodec}				TupleCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{UIntCodec} UIntCodec
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
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @return	{UndefinedCodec} UndefinedCodec
 */
export const Undefined = createUndefinedCodec;

/**
 * Creates a codec for one of many types of value. Each codec type has a match method that returns true if the input value type matches the codec's type. The union codec iterates through codecs until a codec matches and then uses that codec. Some examples of when the union codec can be useful are:
 *
 * - Optional or nullable values.
 * - Versioned types, matching against a property that has a constant version value.
 * - Overloaded values.
 *
 * Serializes to ```[CODEC_INDEX][VALUE]```
 *
 * @param	{Array<AbstractCodec>} codecs - An array of codecs for possible value types.
 * @param	{UnionCodecOptions} [options]
 * @param	{string} [id] - Sets an id that can be pointed to.
 * @param 	{UIntCodec} [options.indexCodec="UInt(48)"] - Codec for the index value.
 * @return	{UnionCodec} UnionCodec
 */
export const Union = createUnionCodec;
