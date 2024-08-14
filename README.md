# bufferfy

A serialization and deserialization library that packs data in the most byte efficient way possible.

This library is inspired by [restructure](https://www.npmjs.com/package/restructure), built from the ground up in typescript, and with many more features.

- Supports all javascript data types.
- Provides accurate typescript types.
- Serializes to a small buffer than message pack and JSON stringify.
- Performs at the same speed as message pack and JSON stringify.
- Supports recursion and pointers.

## Install

```
npm i bufferfy
```

## Usage

```js
import { Codec } from 'bufferfy';

export const ExampleCodec = Codec.Object({
	id: Codec.String({ encoding: "hex", length: 64 }),
	relatedIds: Codec.Array(Codec.String({ encoding: "hex", length: 64 }), {
		lengthCodec: Codec.UInt(8),
	}),
	createdAt: Codec.UInt(48),
	updatedAt: Codec.UInt(48),
	deletedAt: Codec.Optional(Codec.UInt(48)),
});

type ExampleData = CodecType<typeof ExampleCodec>;

const example: ExampleData = {
   // ... values
}

const buffer = ExampleCodec.encode(example)

const data = ExampleCodec.decode(buffer) // returns ExampleData
```

## API

All codecs provide a standard set of methods. The API implements the [abstract-encoding](https://github.com/mafintosh/abstract-encoding) interface.

#### `buffer = AnyCodec.encode(data, buffer?, offset?)`

Returns the data serialized into a buffer. A buffer and offset can be provided, otherwise a new buffer will be created.

#### `data = AnyCodec.decode(buffer, start?, end?)`

Returns the unserialized data from a buffer.

#### `number = AnyCodec.encodingLength(data)`

Returns the byte length of the data if it were serialized.

#### `boolean = AnyCodec.match(data)`

Returns true if the codec is able to serialize and unserialize provided data.

#### `Type = CodecType<typeof codec>`

Returns the value type of the provided codec.

<!-- TSDOC_START -->

## Types

- [Any](#any)
- [Array](#array)
- [BitField](#bitfield)
- [Boolean](#boolean)
- [Buffer](#buffer)
- [Constant](#constant)
- [Enum](#enum)
- [Float](#float)
- [Int](#int)
- [Null](#null)
- [Object](#object)
- [Optional](#optional)
- [Pointer](#pointer)
- [Record](#record)
- [String](#string)
- [Switch](#switch)
- [Transform](#transform)
- [Tuple](#tuple)
- [UInt](#uint)
- [Undefined](#undefined)
- [Union](#union)

### Any

Creates a codec for any or custom values. By default uses JSON.stringify and JSON.parse.

Serializes to ```[LENGTH][VALUE]```

| Constant | Type |
| ---------- | ---------- |
| `Any` | `<Value extends unknown = any>(options?: AnyCodecOptions<Value> or undefined) => AnyCodec<Value>` |

Parameters:

* `id`: - Sets an id that can be pointed to.
* `options.encode`: - Sets a custom encoder.
* `options.decode`: - Sets a custom decoder.
* `options.lengthCodec`: - Codec to specify how the length is encoded.


### Array

Creates a codec for fixed or variable length arrays.

Serializes to ```[LENGTH?][...ITEMS]```

Length is present only for variable length arrays.

| Constant | Type |
| ---------- | ---------- |
| `Array` | `<Item>(itemCodec: AbstractCodec<Item>, options?: ArrayCodecOptions or undefined) => ArrayCodec<Item>` |

Parameters:

* `itemCodec`: - The codec for each item in the array.
* `id`: - Sets an id that can be pointed to.
* `options.length`: - Sets a fixed length.
* `options.lengthPointer`: - Pointer to specify where the length value can be found.
* `options.lengthCodec`: - Codec to specify how the length is encoded.


### BitField

Creates a codec for boolean flags packed into bits of a byte.

Serializes to ```[...FLAG_BYTES]```

Packs up to 8 boolean values associated with the given keys, into each byte.

| Constant | Type |
| ---------- | ---------- |
| `BitField` | `<Key extends PropertyKey>(keys: Key[], options?: BitFieldCodecOptions or undefined) => BitFieldCodec<Key>` |

Parameters:

* `keys`: - Keys for each boolean flag.
* `id`: - Sets an id that can be pointed to.


### Boolean

Creates a codec for a boolean byte

Serializes to ```[0 or 1]```

| Constant | Type |
| ---------- | ---------- |
| `Boolean` | `(options?: BooleanCodecOptions or undefined) => BooleanCodec` |

Parameters:

* `id`: - Sets an id that can be pointed to.


### Buffer

Creates a codec for a fixed or variable length buffer.

Serializes to ```[LENGTH?][BUFFER]```

Length is present only for variable length buffers.

| Constant | Type |
| ---------- | ---------- |
| `Buffer` | `(options?: BufferCodecOptions or undefined) => BufferCodec` |

Parameters:

* `id`: - Sets an id that can be pointed to.
* `options.length`: - Sets a fixed length.
* `options.lengthPointer`: - Pointer to specify where the length value can be found.
* `options.lengthCodec`: - Codec to specify how the length is encoded.


### Constant

Creates a codec for a constant.

Serializes to ```N/A```

No bytes are serialized.

| Constant | Type |
| ---------- | ---------- |
| `Constant` | `<const Value>(value: Value, options?: ConstantCodecOptions or undefined) => ConstantCodec<Value>` |

Parameters:

* `value`: - Value of the constant.
* `id`: - Sets an id that can be pointed to.


### Enum

Creates a codec for enumerated values.

Serializes to ```[INDEX]```

Serializes the index that references the value in the array of enumerated values.

| Constant | Type |
| ---------- | ---------- |
| `Enum` | `<const Value>(values: Value[], options?: EnumCodecOptions or undefined) => EnumCodec<Value>` |

Parameters:

* `values`: - Array of enumerated values.
* `id`: - Sets an id that can be pointed to.
* `options.indexCodec`: - Codec for the index value.


### Float

Creates a codec for a float or double.

Serializes to ```[FLOAT]```

| Constant | Type |
| ---------- | ---------- |
| `Float` | `(bits?: FloatBits or undefined, endianness?: Endianness or undefined, options?: FloatCodecOptions or undefined) => FloatCodec` |

Parameters:

* `bits`: - Bit type of float.
* `endianness`: - Endianness
* `id`: - Sets an id that can be pointed to.


### Int

Creates a codec for a signed integer.

Serializes to ```[INT]```

| Constant | Type |
| ---------- | ---------- |
| `Int` | `<Value extends number = number>(bits?: IntegerBits or undefined, endianness?: Endianness or undefined, options?: IntCodecOptions or undefined) => IntCodec<...>` |

Parameters:

* `bits`: - Bit type of integer.
* `endianness`: - Endianness
* `id`: - Sets an id that can be pointed to.


### Null

Creates a codec for null value.

Serializes to ```N/A```

No bytes are serialized.

| Constant | Type |
| ---------- | ---------- |
| `Null` | `(options?: ConstantCodecOptions or undefined) => NullCodec` |

Parameters:

* `id`: - Sets an id that can be pointed to.


### Object

Creates a codec for an object.

Serializes to ```[...PROPERTY_VALUES]```

Serializes each property value with the codec associated with that key.

| Constant | Type |
| ---------- | ---------- |
| `Object` | `<Properties extends Record<string or number, AbstractCodec<any>>>(properties: Properties, options?: ObjectCodecOptions or undefined) => ObjectCodec<Properties>` |

Parameters:

* `properties`: - Properties of the object.
* `id`: - Sets an id that can be pointed to.


### Optional

Creates a codec for an optional object property.

Serializes to ```[IS_DEFINED][VALUE?]```

A boolean byte for if the value is defined or not. The value if it is defined.

| Constant | Type |
| ---------- | ---------- |
| `Optional` | `<Codec extends AbstractCodec>(codec: Codec, options?: UnionCodecOptions or undefined) => OptionalCodec<Codec>` |

Parameters:

* `codec`: - Codec for the value if it is defined.
* `id`: - Sets an id that can be pointed to.


### Pointer

Creates a codec that becomes the codec/value referenced by targetId. Can be used for recursion or reference a length integer elsewhere in the buffer.

Serializes to ```[TARGET_VALUE]```

| Constant | Type |
| ---------- | ---------- |
| `Pointer` | `<Value extends unknown>(targetId: string) => PointerCodec<Value>` |

Parameters:

* `targetId`: - Id of the target codec/value.


### Record

Creates a codec for a record or map of keys and values.

Serializes to ```[LENGTH?][...[KEY][VALUE]]```

Length is present only for variable length records.

| Constant | Type |
| ---------- | ---------- |
| `Record` | `<Key extends string or number, Value>(keyCodec: AbstractCodec<Key>, valueCodec: AbstractCodec<Value>, options?: RecordCodecOptions or undefined) => RecordCodec<...>` |

Parameters:

* `keyCodec`: - Codec for keys.
* `valueCodec`: - Codec for values.
* `id`: - Sets an id that can be pointed to.
* `options.length`: - Sets a fixed length.
* `options.lengthPointer`: - Pointer to specify where the length value can be found.
* `options.lengthCodec`: - Codec to specify how the length is encoded.


### String

Creates a codec for a fixed or variable length string.

Serializes to ```[LENGTH?][STRING]```

Length is present only for variable length strings.

| Constant | Type |
| ---------- | ---------- |
| `String` | `(options?: StringCodecOptions or undefined) => StringCodec` |

Parameters:

* `id`: - Sets an id that can be pointed to.
* `options.encoding`: - The strings encoding.
* `options.length`: - Sets a fixed length.
* `options.lengthPointer`: - Pointer to specify where the length value can be found.
* `options.lengthCodec`: - Codec to specify how the length is encoded.


### Switch

Creates a set of codecs where the codec used is selected based on conditions from the value or buffer provided. A default codec can be set for unmatched values/buffers. An example of where this can be useful is for an object with many different versions.

Serializes to ```[VALUE]```

| Constant | Type |
| ---------- | ---------- |
| `Switch` | `<CodecMap extends Record<PropertyKey, AbstractCodec<any>>>(codecMap: CodecMap, options: SwitchCodecOptions<CodecMap>) => SwitchCodec<CodecMap>` |

Parameters:

* `codecMap`: - An map of keys and codecs where keys are case values for the switch.
* `id`: - Sets an id that can be pointed to.
* `getValueCase`: - A function that takes a value and returns a key of the codecMap, selecting the appropriate codec.
* `getBufferCase`: - A function that takes a buffer and returns a key of the codecMap, selecting the appropriate codec.
* `default`: - The key of the codecMap that selects the codec used for unmatched values/buffers.


### Transform

Creates a codec wrapper that transforms a value when serializing and deserializing.

Serializes to ```[VALUE]```

Uses the wrapped codecs serialization.

| Constant | Type |
| ---------- | ---------- |
| `Transform` | `<Source extends unknown, Target extends unknown>(codec: AbstractCodec<Target>, options: TransformCodecOptions<Source, Target>) => TransformCodec<Source, Target>` |

Parameters:

* `codec`: - The wrapped codec.
* `id`: - Sets an id that can be pointed to.
* `options.transform`: - Function that transforms the value into the wrapped codecs expected value.
* `options.untransform`: - Function that transforms the wrapped codecs value into the expected value.


### Tuple

Creates a codec for a tuple of values.

Serializes to ```[...ITEMS]```

| Constant | Type |
| ---------- | ---------- |
| `Tuple` | `<Tuple extends [...any[]]>(codecs: [...{ [Index in keyof Tuple]: AbstractCodec<Tuple[Index]>; }], options?: TupleCodecOptions or undefined) => TupleCodec<...>` |

Parameters:

* `codecs`: - A series of codecs for each value of the tuple.
* `id`: - Sets an id that can be pointed to.


### UInt

Creates a codec for a unsigned integer.

Serializes to ```[UINT]```

| Constant | Type |
| ---------- | ---------- |
| `UInt` | `<Value extends number = number>(bits?: IntegerBits or undefined, endianness?: Endianness or undefined, options?: UIntCodecOptions or undefined) => UIntCodec<...>` |

Parameters:

* `bits`: - Bit type of integer.
* `endianness`: - Endianness
* `id`: - Sets an id that can be pointed to.


### Undefined

Creates a codec for undefined value.

Serializes to ```N/A```

Uses the undefined value in the codec, no bytes are serialized.

| Constant | Type |
| ---------- | ---------- |
| `Undefined` | `(options?: ConstantCodecOptions or undefined) => UndefinedCodec` |

Parameters:

* `id`: - Sets an id that can be pointed to.


### Union

Creates a codec for one of many types of value. Each codec type has a match method that returns true if the input value type matches the codec's type. The union codec iterates through codecs until a codec matches and then uses that codec. Some examples of when the union codec can be useful are:

- Optional or nullable values.
- Overloaded values.

Serializes to ```[CODEC_INDEX][VALUE]```

| Constant | Type |
| ---------- | ---------- |
| `Union` | `<const Codecs extends Array<AbstractCodec<any>>>(codecs: Codecs, options?: UnionCodecOptions or undefined) => UnionCodec<Codecs>` |

Parameters:

* `codecs`: - An array of codecs for possible value types.
* `id`: - Sets an id that can be pointed to.
* `options.indexCodec`: - Codec for the index value.




<!-- TSDOC_END -->

## Benchmarks

Values used for benchmarks can be found [here](https://github.com/visionsofparadise/bufferfy/blob/main/src/utilities/TestValues.ts).

#### Spread of Types

```
bufferfy.size                   51
msgpack.size                    149
JSON.size                       221
```

#### Common Types
```
bufferfy.size                   1056
msgpack.size                    1706
JSON.size                       1775
```