import { createUIntCodec, endiannessValues, UInt8Codec, UINT_BIT_BYTE_MAP, uIntBitValues } from ".";
import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
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
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes uInt8 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0]).toBe(value);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes uInt8 from buffer", async () => {
		const buffer = Buffer.from([value]);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams uInt8 to buffer`, async () => {
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

	it(`streams uInt8 from buffer`, async () => {
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
					const resultByteLength = codec.byteLength(value);

					expect(resultByteLength).toBe(byteLength);
				});

				it(`encodes uInt${bits}${endianness} to buffer`, async () => {
					const buffer = codec.encode(value);

					expect(buffer[`readUInt${endianness}`](0, byteLength)).toBe(value);
					expect(buffer.byteLength).toBe(byteLength);
				});

				it(`decodes uInt${bits}${endianness} from buffer`, async () => {
					const buffer = Buffer.allocUnsafe(byteLength);

					buffer[`writeUInt${endianness}`](value, 0, byteLength);

					const result = codec.decode(buffer);

					expect(result).toBe(value);
				});

				it(`streams uInt${bits}${endianness} to buffer`, async () => {
					const stream = new BufferWriteStream();

					const encoder = codec.Encoder();

					await new Promise((resolve) => {
						stream.on("finish", resolve);

						encoder.pipe(stream);
						encoder.write(value);
						encoder.end();
					});

					expect(stream.buffer![`readUInt${endianness}`](0, byteLength)).toBe(value);
					expect(stream.offset).toBe(byteLength);
				});

				it(`streams uInt${bits}${endianness} from buffer`, async () => {
					const buffer = Buffer.allocUnsafe(byteLength);

					buffer[`writeUInt${endianness}`](value, 0, byteLength);

					const stream = new BufferReadStream(buffer);

					const decoder = codec.Decoder();

					await new Promise((resolve) => {
						decoder.on("finish", resolve);

						stream.pipe(decoder);
					});

					expect(decoder.read(1)).toBe(value);
				});
			});
		}
	}
});
