# bufferfy

A serialization and deserialization library that space-efficiently packs data into buffers.

- Supports all javascript data types.
- Provides accurate typescript types.
- Serializes to a significantly smaller buffer than message pack and JSON stringify.
- Performs at the same speed as message pack and JSON stringify.
- Encode and decode transforms for streams.

## 3.0.0 Update

This module is now browser compatible, due to this the following changes have been made:
- When handling bytes, Uint8Arrays are now used instead of node buffers.
- Node style streams have been replaced by WebApi streams.

## Install

```
npm i bufferfy
```

## Usage

```js
import { Codec } from 'bufferfy';

export const ExampleCodec = Codec.Object({
	id: Codec.String("hex", 32),
	relatedIds: Codec.Array(Codec.String("hex", 32)),
	createdAt: Codec.VarInt(),
	updatedAt: Codec.VarInt(),
	deletedAt: Codec.Optional(Codec.VarInt()),
});

type ExampleData = CodecType<typeof ExampleCodec>;

const example: ExampleData = {
   // ... values
}

const buffer = ExampleCodec.encode(example)

const data = ExampleCodec.decode(buffer) // returns ExampleData

// Streams
const encoder = ExampleCodec.Encoder(); // Takes values and outputs buffer chunks

encoder.pipe(stream);
encoder.write(value);
encoder.end();

const decoder = ExampleCodec.Decoder(); // Takes buffer chunks and outputs values

decoder.on("data", (data) => {
	// ... logic
});

stream.pipe(decoder);
```

## API

All codecs provide a standard set of methods.

#### `buffer = AnyCodec.encode(data, target?, offset?)`

Returns the data serialized into a buffer. A buffer and offset can be provided, otherwise a new buffer will be created.

#### `data = AnyCodec.decode(buffer, start?, end?)`

Returns the unserialized data from a buffer.

#### `number = AnyCodec.byteLength(data)`

Returns the byte length of the data if it were serialized.

#### `boolean = AnyCodec.isValid(data)`

Returns true if the codec is able to serialize and unserialize provided data.

#### `Type = CodecType<typeof codec>`

Returns the value type of the provided codec.

## Types

- [Abstract](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Abstract/index.ts)
- [Any](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Any/index.ts)
- [Array](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Array/index.ts)
- [BitField](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/BitField/index.ts)
- [Boolean](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Boolean/index.ts)
- [Bytes](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Bytes/index.ts)
- [Constant](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Constant/index.ts)
- [Float](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Float/index.ts)
- [Int](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Int/index.ts)
- [Object](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Object/index.ts)
- [Record](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Record/index.ts)
- [String](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/String/index.ts)
- [Transform](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Transform/index.ts)
- [Tuple](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Tuple/index.ts)
- [UInt](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/UInt/index.ts)
- [Union](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Union/index.ts)
- [VarInt](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/VarInt/index.ts)

## Utilities

- [Merge](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Object/Merge/index.ts)
- [Omit](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Object/Omit/index.ts)
- [Pick](https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Object/Pick/index.ts)

## Benchmarks

Values used for benchmarks can be found [here](https://github.com/visionsofparadise/bufferfy/blob/main/src/utilities/TestValues.ignore.ts).

#### Spread of Types

```
bufferfy.size                   50
msgpack.size                    149
JSON.size                       221
```

#### Common Types
```
bufferfy.size                   1050
msgpack.size                    1706
JSON.size                       1775
```