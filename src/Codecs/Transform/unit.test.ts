import { TransformCodec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";
import { createUIntCodec } from "../UInt";
import { createObjectCodec } from "../Object";

describe("correctly performs transform codec methods", () => {
	const codec = new TransformCodec(new BooleanCodec(), {
		decode: (boolean) => {
			if (boolean === true) return 1;
			if (boolean === false) return 0;

			throw new Error("Invalid value");
		},
		encode: (value) => {
			if (value !== 1 && value !== 0) throw new Error("Invalid value");

			return value === 1;
		},
	});
	const value: CodecType<typeof codec> = 1;
	const byteLength = 1;

	it("valid for transform", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not transform", () => {
		const isValid = codec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of transform", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes transform to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes transform from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams transform to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams transform from buffer`, async () => {
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

describe("decode callback receives correct buffer bytes", () => {
	it("passes correct buffer bytes for single-byte codec", () => {
		let capturedBuffer: Uint8Array | undefined;

		const codec = new TransformCodec(new BooleanCodec(), {
			decode: (boolean, buffer) => {
				capturedBuffer = buffer;
				return boolean ? 1 : 0;
			},
			encode: (value) => value === 1,
		});

		const buffer = codec.encode(1);
		codec.decode(buffer);

		expect(capturedBuffer).toBeDefined();
		expect(capturedBuffer!.byteLength).toBe(1);
		expect(capturedBuffer![0]).toBe(1); // true is encoded as 1
	});

	it("passes correct buffer bytes for multi-byte codec", () => {
		let capturedBuffer: Uint8Array | undefined;

		const UInt32Codec = createUIntCodec(32);
		const codec = new TransformCodec(UInt32Codec, {
			decode: (value, buffer) => {
				capturedBuffer = buffer;
				return value.toString();
			},
			encode: (str) => parseInt(str, 10),
		});

		const testValue = 0x12345678;
		const buffer = codec.encode(testValue.toString());
		const result = codec.decode(buffer);

		expect(capturedBuffer).toBeDefined();
		expect(capturedBuffer!.byteLength).toBe(4);
		expect(Array.from(capturedBuffer!)).toEqual([0x12, 0x34, 0x56, 0x78]);
		expect(result).toBe(testValue.toString());
	});

	it("passes correct buffer slice when decoding from offset", () => {
		let capturedBuffer: Uint8Array | undefined;

		const UInt32Codec = createUIntCodec(32);
		const codec = new TransformCodec(UInt32Codec, {
			decode: (value, buffer) => {
				capturedBuffer = buffer;
				return value;
			},
			encode: (value) => value,
		});

		// Create a buffer with padding before and after
		const paddingBefore = new Uint8Array([0xff, 0xff]);
		const encoded = codec.encode(0x12345678);
		const paddingAfter = new Uint8Array([0xaa, 0xaa]);

		const combinedBuffer = new Uint8Array([
			...paddingBefore,
			...encoded,
			...paddingAfter,
		]);

		const result = codec.decode(combinedBuffer, 2);

		expect(capturedBuffer).toBeDefined();
		expect(capturedBuffer!.byteLength).toBe(4);
		expect(Array.from(capturedBuffer!)).toEqual([0x12, 0x34, 0x56, 0x78]);
		expect(result).toBe(0x12345678);
	});

	it("passes correct buffer bytes for composite codec", () => {
		let capturedBuffer: Uint8Array | undefined;

		const targetCodec = createObjectCodec({
			a: createUIntCodec(16),
			b: createUIntCodec(16),
		});

		type DecodedValue = { sum: number; buffer: number[] };
		type EncodedValue = { a: number; b: number };

		const codec = new TransformCodec<DecodedValue, EncodedValue>(targetCodec, {
			decode: (value, buffer) => {
				capturedBuffer = buffer;
				return { sum: value.a + value.b, buffer: Array.from(buffer) };
			},
			encode: (value) => {
				const half = Math.floor(value.sum / 2);
				return { a: half, b: value.sum - half };
			},
		});

		const buffer = codec.encode({ sum: 100, buffer: [] });
		const result = codec.decode(buffer);

		expect(capturedBuffer).toBeDefined();
		expect(capturedBuffer!.byteLength).toBe(4); // 2 bytes for a, 2 bytes for b
		expect(result.sum).toBe(100);
		expect(result.buffer).toEqual(Array.from(capturedBuffer!));
	});

	it("buffer parameter can be used for validation/checksums", () => {
		const UInt16Codec = createUIntCodec(16);

		// Simple checksum: sum of all bytes
		const codec = new TransformCodec(UInt16Codec, {
			decode: (value, buffer) => {
				const checksum = Array.from(buffer).reduce((sum, byte) => sum + byte, 0) % 256;
				return { value, checksum };
			},
			encode: (obj) => obj.value,
		});

		const testValue = 0x1234;
		const buffer = codec.encode({ value: testValue, checksum: 0 });
		const result = codec.decode(buffer);

		expect(result.value).toBe(testValue);
		expect(result.checksum).toBe((0x12 + 0x34) % 256);
	});
});
