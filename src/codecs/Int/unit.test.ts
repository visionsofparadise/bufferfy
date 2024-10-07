import { createIntCodec, Int8Codec } from ".";
import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { CodecType } from "../Abstract";
import { endiannessValues, UINT_BIT_BYTE_MAP, uIntBitValues } from "../UInt";

describe("correctly performs int8 codec methods", () => {
	const bits = 8;
	const codec = new Int8Codec();
	const value: CodecType<typeof codec> = 0 - (2 ** bits / 2 - 1);
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
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes int8 to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer[0]).toBe(0);
		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes int8 from buffer", async () => {
		const buffer = Buffer.from([0]);

		const result = codec.decode(buffer);

		expect(result).toBe(value);
	});

	it(`streams int8 to buffer`, async () => {
		const stream = new BufferWriteStream();

		const encoder = codec.Encoder();

		await new Promise((resolve) => {
			stream.on("finish", resolve);

			encoder.pipe(stream);
			encoder.write(value);
			encoder.end();
		});

		expect(stream.buffer![0]).toBe(0);
		expect(stream.offset).toBe(byteLength);
	});

	it(`streams int8 from buffer`, async () => {
		const buffer = Buffer.allocUnsafe(byteLength);

		buffer[0] = 0;

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toBe(value);
	});
});

describe("iterates int endianness and bits combinations", () => {
	for (const endianness of endiannessValues) {
		for (const bits of uIntBitValues) {
			if (bits === 8) continue;

			describe(`correctly performs int${bits}${endianness} codec methods`, () => {
				const codec = createIntCodec(bits, endianness);
				const value = 0 - (2 ** bits / 2 - 1);
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
					const resultByteLength = codec.byteLength(value);

					expect(resultByteLength).toBe(byteLength);
				});

				it(`encodes int${bits}${endianness} to buffer`, async () => {
					const buffer = codec.encode(value);

					expect(buffer[`readUInt${endianness}`](0, byteLength)).toBe(0);
					expect(buffer.byteLength).toBe(byteLength);
				});

				it(`decodes int${bits}${endianness} from buffer`, async () => {
					const buffer = Buffer.allocUnsafe(byteLength);

					buffer[`writeUInt${endianness}`](0, 0, byteLength);

					const result = codec.decode(buffer);

					expect(result).toBe(value);
				});

				it(`streams int${bits}${endianness} to buffer`, async () => {
					const stream = new BufferWriteStream();

					const encoder = codec.Encoder();

					await new Promise((resolve) => {
						stream.on("finish", resolve);

						encoder.pipe(stream);
						encoder.write(value);
						encoder.end();
					});

					expect(stream.buffer![`readUInt${endianness}`](0, byteLength)).toBe(0);
					expect(stream.offset).toBe(byteLength);
				});

				it(`streams int${bits}${endianness} from buffer`, async () => {
					const buffer = Buffer.allocUnsafe(byteLength);

					buffer[`writeUInt${endianness}`](0, 0, byteLength);

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
