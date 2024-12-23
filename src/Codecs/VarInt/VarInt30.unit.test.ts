import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { VarInt30Codec } from "./VarInt30";

describe("correctly performs varInt30 codec methods for 1 byte", () => {
	const codec = new VarInt30Codec();
	const value: CodecType<typeof codec> = 63;
	const byteLength = 1;

	it("valid for varInt30", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not varInt30", () => {
		const isValid = codec.isValid(value.toString(10));

		expect(isValid).toBe(false);
	});

	it("returns byteLength of varInt30", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("returns byteLength 2 for varInt30 at 64", () => {
		const resultByteLength = codec.byteLength(value + 1);

		expect(resultByteLength).toBe(2);
	});

	it("encodes varInt30 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0]).toBe(value);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt30 from buffer", async () => {
		const buffer = Uint8Array.from([value]);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt30 to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.bytes![0]).toBe(value);
		expect(stream.offset).toBe(byteLength);
	});

	it(`streams varInt30 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});

describe("correctly performs varInt30 codec methods for 2 bytes max", () => {
	const codec = new VarInt30Codec();
	const value: CodecType<typeof codec> = 16383;
	const byteLength = 2;

	it("valid for varInt30", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt30", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt30 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x40).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt30 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt30 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});

describe("correctly performs varInt30 codec methods for 2 bytes min", () => {
	const codec = new VarInt30Codec();
	const value: CodecType<typeof codec> = 64;
	const byteLength = 2;

	it("valid for varInt30", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt30", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt30 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x40).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt30 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt30 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});

describe("correctly performs varInt30 codec methods for 3 bytes max", () => {
	const codec = new VarInt30Codec();
	const value: CodecType<typeof codec> = 4194303;
	const byteLength = 3;

	it("valid for varInt30", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt30", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt30 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x80).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt30 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt30 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});

describe("correctly performs varInt30 codec methods for 3 bytes min", () => {
	const codec = new VarInt30Codec();
	const value: CodecType<typeof codec> = 16384;
	const byteLength = 3;

	it("valid for varInt30", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt30", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt30 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x80).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt30 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt30 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});

describe("correctly performs varInt30 codec methods for 4 bytes max", () => {
	const codec = new VarInt30Codec();
	const value: CodecType<typeof codec> = 1073741823;
	const byteLength = 4;

	it("valid for varInt30", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt30", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt30 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0xc0).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt30 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt30 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});

describe("correctly performs varInt30 codec methods for 4 bytes min", () => {
	const codec = new VarInt30Codec();
	const value: CodecType<typeof codec> = 4194304;
	const byteLength = 4;

	it("valid for varInt30", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt30", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt30 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0xc0).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt30 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt30 from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});
