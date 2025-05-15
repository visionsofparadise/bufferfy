import { createBigUIntCodec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { endiannessValues } from "../UInt";

describe("iterates float endianness and bits combinations", () => {
	for (const endianness of endiannessValues) {
		describe(`correctly performs bigUInt${endianness} codec methods`, () => {
			const codec = createBigUIntCodec(endianness);
			const value = BigInt(512);
			const byteLength = 8;

			it(`valid for bigUInt${endianness}`, () => {
				const isValid = codec.isValid(value);

				expect(isValid).toBe(true);
			});

			it(`invalid for not bigUInt${endianness}`, () => {
				const isValid = codec.isValid(value.toString(10));

				expect(isValid).toBe(false);
			});

			it(`returns byteLength of bigUInt${endianness}`, () => {
				const resultByteLength = codec.byteLength();

				expect(resultByteLength).toBe(byteLength);
			});

			it(`encodes bigUInt${endianness} to buffer`, async () => {
				const buffer = codec.encode(value);

				expect(codec.decode(buffer)).toBe(value);

				expect(buffer.byteLength).toBe(byteLength);
			});

			it(`decodes bigUInt${endianness} from buffer`, async () => {
				const buffer = new ArrayBuffer(byteLength);

				const dataView = new DataView(buffer, 0, byteLength);

				dataView.setBigUint64(0, value, endianness === "LE");

				const result = codec.decode(new Uint8Array(buffer, 0, byteLength));

				expect(result).toBe(value);
			});

			it(`streams bigUInt${endianness} to buffer`, async () => {
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

			it(`streams bigUInt${endianness} from buffer`, async () => {
				const buffer = new ArrayBuffer(byteLength);

				const dataView = new DataView(buffer, 0, byteLength);

				dataView.setBigUint64(0, value, endianness === "LE");

				const stream = new BytesReadableStream(new Uint8Array(buffer, 0, byteLength));

				const decoder = codec.Decoder();

				const readable = stream.pipeThrough(decoder);

				const reader = readable.getReader();

				const result = await reader.read();
				await reader.cancel();

				expect(result.value).toBe(value);
			});
		});
	}
});
