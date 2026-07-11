import { createUIntCodec, endiannessValues, type Endianness, UInt8Codec, UINT_BIT_BYTE_MAP, uIntBitValues } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";

describe("correctly performs uInt8 codec methods", () => {
	const bits = 8;
	const codec = new UInt8Codec();
	const value: CodecType<typeof codec> = 2 ** bits - 1;
	const byteLength = UINT_BIT_BYTE_MAP[bits];

	it("valid for uInt8", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not uInt8", () => {
		const isValid = codec.isValid(value.toString(10));

		expect(isValid).toBe(false);
	});

	it("returns byteLength of uInt8", () => {
		const resultByteLength = codec.byteLength();

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes uInt8 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0]).toBe(value);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes uInt8 from buffer", async () => {
		const buffer = Uint8Array.from([value]);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams uInt8 to buffer`, async () => {
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

	it(`streams uInt8 from buffer`, async () => {
		const buffer = Uint8Array.from([value]);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});

describe("iterates uInt endianness and bits combinations", () => {
	for (const endianness of endiannessValues) {
		for (const bits of uIntBitValues) {
			if (bits === 8) continue;

			describe(`correctly performs uInt${bits}${endianness} codec methods`, () => {
				const codec = createUIntCodec(bits, endianness);
				const value = 2 ** bits - 1;
				const byteLength = UINT_BIT_BYTE_MAP[bits];

				it(`valid for uInt${bits}${endianness}`, () => {
					const isValid = codec.isValid(value);

					expect(isValid).toBe(true);
				});

				it(`invalid for not uInt${bits}${endianness}`, () => {
					const isValid = codec.isValid(value.toString(10));

					expect(isValid).toBe(false);
				});

				it(`returns byteLength of uInt${bits}${endianness}`, () => {
					const resultByteLength = codec.byteLength();

					expect(resultByteLength).toBe(byteLength);
				});

				it(`encodes uInt${bits}${endianness} to buffer`, async () => {
					const buffer = codec.encode(value);

					const result = codec.decode(buffer);

					expect(result).toBe(value);
					expect(buffer.byteLength).toBe(byteLength);
				});

				it(`decodes uInt${bits}${endianness} from buffer`, async () => {
					const buffer = codec.encode(value);

					const result = codec.decode(buffer);

					expect(result).toBe(value);
				});

				it(`streams uInt${bits}${endianness} to buffer`, async () => {
					const stream = new BytesWritableStream();

					const encoder = codec.Encoder();

					const promise = encoder.readable.pipeTo(stream);

					const writer = encoder.writable.getWriter();

					await writer.write(value);
					await writer.close();

					await promise;

					expect(codec.decode(stream.bytes!)).toBe(value);
					expect(stream.offset).toBe(byteLength);
				});

				it(`streams uInt${bits}${endianness} from buffer`, async () => {
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
		}
	}
});

describe("uInt exact-byte wire format guards", () => {
	const midBytes = [0x11, 0x22, 0x33, 0x44, 0x55, 0x66];

	const wire = (logical: Array<number>, endianness: Endianness): Uint8Array => Uint8Array.from(endianness === "LE" ? [...logical].reverse() : logical);

	for (const endianness of endiannessValues) {
		for (const bits of uIntBitValues) {
			const byteLength = UINT_BIT_BYTE_MAP[bits];
			const codec = createUIntCodec(bits, endianness);

			const zeroLogical = new Array(byteLength).fill(0);
			const midLogical = midBytes.slice(0, byteLength);
			const maxLogical = new Array(byteLength).fill(0xff);

			const midValue = midLogical.reduce((accumulator, byte) => accumulator * 256 + byte, 0);
			const maxValue = 2 ** bits - 1;

			it(`encodes uInt${bits}${endianness} zero to exact bytes`, () => {
				const expected = wire(zeroLogical, endianness);

				expect(codec.encode(0)).toEqual(expected);
				expect(codec.decode(expected)).toBe(0);
			});

			it(`encodes uInt${bits}${endianness} distinct mid value to exact bytes`, () => {
				const expected = wire(midLogical, endianness);

				expect(codec.encode(midValue)).toEqual(expected);
				expect(codec.decode(expected)).toBe(midValue);
			});

			it(`encodes uInt${bits}${endianness} maximum to exact bytes`, () => {
				const expected = wire(maxLogical, endianness);

				expect(codec.encode(maxValue)).toEqual(expected);
				expect(codec.decode(expected)).toBe(maxValue);
			});
		}
	}
});
