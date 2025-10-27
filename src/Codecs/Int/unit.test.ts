import { createIntCodec, Int8Codec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { endiannessValues, UINT_BIT_BYTE_MAP, uIntBitValues } from "../UInt";

describe("correctly performs int8 codec methods", () => {
	const bits = 8;
	const codec = new Int8Codec();
	const value: CodecType<typeof codec> = 0 - 2 ** bits / 2;
	const byteLength = UINT_BIT_BYTE_MAP[bits];

	it("valid for int8", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not int8", () => {
		const isValid = codec.isValid(value.toString(10));

		expect(isValid).toBe(false);
	});

	it("returns byteLength of int8", () => {
		const resultByteLength = codec.byteLength();

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes int8 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(codec.decode(buffer)).toBe(value);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes int8 from buffer", async () => {
		const buffer = Uint8Array.from([0]);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams int8 to buffer`, async () => {
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

	it(`streams int8 from buffer`, async () => {
		const buffer = new Uint8Array(byteLength);

		buffer[0] = 0;

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});

describe("iterates int endianness and bits combinations", () => {
	for (const endianness of endiannessValues) {
		for (const bits of uIntBitValues) {
			if (bits === 8) continue;

			describe(`correctly performs int${bits}${endianness} codec methods`, () => {
				const codec = createIntCodec(bits, endianness);
				const value = 0 - 2 ** bits / 2;
				const byteLength = UINT_BIT_BYTE_MAP[bits];

				it(`valid for int${bits}${endianness}`, () => {
					const isValid = codec.isValid(value);

					expect(isValid).toBe(true);
				});

				it(`invalid for not int${bits}${endianness}`, () => {
					const isValid = codec.isValid(value.toString(10));

					expect(isValid).toBe(false);
				});

				it(`returns byteLength of int${bits}${endianness}`, () => {
					const resultByteLength = codec.byteLength();

					expect(resultByteLength).toBe(byteLength);
				});

				it(`encodes int${bits}${endianness} to buffer`, async () => {
					const buffer = codec.encode(value);

					expect(codec.decode(buffer)).toBe(value);
					expect(buffer.byteLength).toBe(byteLength);
				});

				it(`decodes int${bits}${endianness} from buffer`, async () => {
					const buffer = codec.encode(value);

					const result = codec.decode(buffer);

					expect(result).toBe(value);
				});

				it(`streams int${bits}${endianness} to buffer`, async () => {
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

				it(`streams int${bits}${endianness} from buffer`, async () => {
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
