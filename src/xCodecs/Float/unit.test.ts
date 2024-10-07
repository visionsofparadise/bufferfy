import { createFloatCodec, FLOAT_BIT_BYTE_MAP, floatBitValues } from ".";
import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { endiannessValues } from "../UInt";

describe("iterates float endianness and bits combinations", () => {
	for (const endianness of endiannessValues) {
		for (const bits of floatBitValues) {
			describe(`correctly performs float${bits}${endianness} codec methods`, () => {
				const codec = createFloatCodec(bits, endianness);
				const value = Math.PI;
				const byteLength = FLOAT_BIT_BYTE_MAP[bits];

				it(`valid for float${bits}${endianness}`, () => {
					const isValid = codec.isValid(value);

					expect(isValid).toBe(true);
				});

				it(`invalid for not float${bits}${endianness}`, () => {
					const isValid = codec.isValid(value.toString(10));

					expect(isValid).toBe(false);
				});

				it(`returns byteLength of float${bits}${endianness}`, () => {
					const resultByteLength = codec.byteLength(value);

					expect(resultByteLength).toBe(byteLength);
				});

				it(`encodes float${bits}${endianness} to buffer`, async () => {
					const buffer = codec.encode(value);

					if (bits === 32) expect(buffer[`readFloat${endianness}`]()).toBeCloseTo(value);
					else expect(buffer[`readDouble${endianness}`]()).toBeCloseTo(value);

					expect(buffer.byteLength).toBe(byteLength);
				});

				it(`decodes float${bits}${endianness} from buffer`, async () => {
					const buffer = Buffer.allocUnsafe(byteLength);

					if (bits === 32) buffer[`writeFloat${endianness}`](value);
					else buffer[`writeDouble${endianness}`](value);

					const result = codec.decode(buffer);

					expect(result).toBeCloseTo(value);
				});

				it(`streams float${bits}${endianness} to buffer`, async () => {
					const stream = new BufferWriteStream();

					const encoder = codec.Encoder();

					await new Promise((resolve) => {
						stream.on("finish", resolve);

						encoder.pipe(stream);
						encoder.write(value);
						encoder.end();
					});

					if (bits === 32) expect(stream.buffer![`readFloat${endianness}`]()).toBeCloseTo(value);
					else expect(stream.buffer![`readDouble${endianness}`]()).toBeCloseTo(value);

					expect(stream.offset).toBe(byteLength);
				});

				it(`streams float${bits}${endianness} from buffer`, async () => {
					const buffer = Buffer.allocUnsafe(byteLength);

					if (bits === 32) buffer[`writeFloat${endianness}`](value);
					else buffer[`writeDouble${endianness}`](value);

					const stream = new BufferReadStream(buffer);

					const decoder = codec.Decoder();

					await new Promise((resolve) => {
						decoder.on("finish", resolve);

						stream.pipe(decoder);
					});

					expect(decoder.read(1)).toBeCloseTo(value);
				});
			});
		}
	}
});
