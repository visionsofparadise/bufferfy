import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { CodecType } from "../Abstract";
import { VarInt60Codec } from "./VarInt60";

describe("correctly performs varInt60 codec methods for 1 byte", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 31;
	const byteLength = 1;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not varInt60", () => {
		const isValid = codec.isValid(value.toString(10));

		expect(isValid).toBe(false);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("returns byteLength 2 for varInt60 at 64", () => {
		const resultByteLength = codec.byteLength(value + 1);

		expect(resultByteLength).toBe(2);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0]).toBe(value);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = Buffer.from([value]);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 to buffer`, async () => {
		const stream = new BufferWriteStream();

		const encoder = codec.Encoder();

		await new Promise((resolve) => {
			stream.on("finish", resolve);

			encoder.pipe(stream);
			encoder.write(value);
			encoder.end();
		});

		expect(stream.buffer![0]).toBe(value);
		expect(stream.offset).toBe(byteLength);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = Buffer.allocUnsafe(byteLength);

		buffer[0] = value;

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 2 bytes max", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 8191;
	const byteLength = 2;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x20).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 2 bytes min", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 32;
	const byteLength = 2;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x20).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 3 bytes max", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 2097151;
	const byteLength = 3;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x40).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 3 bytes min", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 8192;
	const byteLength = 3;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x40).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 4 bytes max", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 536870911;
	const byteLength = 4;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x60).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 4 bytes min", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 2097152;
	const byteLength = 4;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x60).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 5 bytes max", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 137438953471;
	const byteLength = 5;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x80).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 5 bytes min", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 536870912;
	const byteLength = 5;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x80).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 6 bytes max", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 35184372088831;
	const byteLength = 6;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0xa0).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 6 bytes min", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 137438953472;
	const byteLength = 6;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0xa0).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 7 bytes max", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 281474976710655;
	const byteLength = 7;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0xc0).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("correctly performs varInt60 codec methods for 7 bytes min", () => {
	const codec = new VarInt60Codec();
	const value: CodecType<typeof codec> = 35184372088832;
	const byteLength = 7;

	it("valid for varInt60", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt60", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt60 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0xc0).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt60 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt60 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});
