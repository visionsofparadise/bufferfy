import { createFloatCodec, FLOAT_BIT_BYTE_MAP, floatBitValues } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
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
					const resultByteLength = codec.byteLength();

					expect(resultByteLength).toBe(byteLength);
				});

				it(`encodes float${bits}${endianness} to buffer`, async () => {
					const buffer = codec.encode(value);

					expect(codec.decode(buffer)).toBeCloseTo(value);

					expect(buffer.byteLength).toBe(byteLength);
				});

				it(`decodes float${bits}${endianness} from buffer`, async () => {
					const buffer = new ArrayBuffer(byteLength);

					const dataView = new DataView(buffer, 0, byteLength);

					if (bits === 32) dataView.setFloat32(0, value, endianness === "LE");
					else dataView.setFloat64(0, value, endianness === "LE");

					const result = codec.decode(new Uint8Array(buffer, 0, byteLength));

					expect(result).toBeCloseTo(value);
				});

				it(`streams float${bits}${endianness} to buffer`, async () => {
					const stream = new BytesWritableStream();

					const encoder = codec.Encoder();

					const promise = encoder.readable.pipeTo(stream);

					const writer = encoder.writable.getWriter();

					await writer.write(value);
					await writer.close();

					await promise;

					expect(codec.decode(stream.bytes!)).toBeCloseTo(value);

					expect(stream.offset).toBe(byteLength);
				});

				it(`streams float${bits}${endianness} from buffer`, async () => {
					const buffer = new ArrayBuffer(byteLength);

					const dataView = new DataView(buffer, 0, byteLength);

					if (bits === 32) dataView.setFloat32(0, value, endianness === "LE");
					else dataView.setFloat64(0, value, endianness === "LE");

					const stream = new BytesReadableStream(new Uint8Array(buffer, 0, byteLength));

					const decoder = codec.Decoder();

					const readable = stream.pipeThrough(decoder);

					const reader = readable.getReader();

					const result = await reader.read();
					await reader.cancel();

					expect(result.value).toBeCloseTo(value);
				});
			});
		}
	}
});
