import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { CodecType } from "../Abstract";
import { VarInt15Codec } from "./VarInt15";

describe("correctly performs varInt15 codec methods for 1 byte", () => {
	const codec = new VarInt15Codec();
	const value: CodecType<typeof codec> = 127;
	const byteLength = 1;

	it("valid for varInt15", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not varInt15", () => {
		const isValid = codec.isValid(value.toString(10));

		expect(isValid).toBe(false);
	});

	it("returns byteLength of varInt15", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("returns byteLength 2 for varInt15 at 128", () => {
		const resultByteLength = codec.byteLength(value + 1);

		expect(resultByteLength).toBe(2);
	});

	it("encodes varInt15 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0]).toBe(value);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt15 from buffer", async () => {
		const buffer = Buffer.from([value]);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt15 to buffer`, async () => {
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

	it(`streams varInt15 from buffer`, async () => {
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

describe("correctly performs varInt15 codec methods for 2 bytes max", () => {
	const codec = new VarInt15Codec();
	const value: CodecType<typeof codec> = 32767;
	const byteLength = 2;

	it("valid for varInt15", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for varInt15 too large", () => {
		const isValid = codec.isValid(value + 1);

		expect(isValid).toBe(false);
	});

	it("returns byteLength of varInt15", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt15 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x80).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt15 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt15 from buffer`, async () => {
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

describe("correctly performs varInt15 codec methods for 2 bytes min", () => {
	const codec = new VarInt15Codec();
	const value: CodecType<typeof codec> = 128;
	const byteLength = 2;

	it("valid for varInt15", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of varInt15", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes varInt15 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0] >= 0x80).toBe(true);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes varInt15 from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams varInt15 from buffer`, async () => {
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
