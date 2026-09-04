import { createBigUIntCodec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { endiannessValues, type Endianness } from "../UInt";

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

describe("bigUInt exact-byte wire format guards", () => {
	const wire = (logical: Array<number>, endianness: Endianness): Uint8Array => Uint8Array.from(endianness === "LE" ? [...logical].reverse() : logical);

	const distinctLogical = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08];
	const value = 0x0102030405060708n;

	for (const endianness of endiannessValues) {
		const codec = createBigUIntCodec(endianness);

		it(`encodes bigUInt${endianness} to exact bytes`, () => {
			const expected = wire(distinctLogical, endianness);

			expect(codec.encode(value)).toEqual(expected);
			expect(codec.decode(expected)).toBe(value);
		});
	}
});

describe("bigUInt isValid enforces the intrinsic 0 <= value < 2^64 range", () => {
	const codec = createBigUIntCodec("BE");

	it("rejects negative bigints", () => {
		expect(codec.isValid(-1n)).toBe(false);
	});

	it("rejects values at or above 2^64", () => {
		expect(codec.isValid(2n ** 64n)).toBe(false);
	});

	it("accepts the maximum representable value 2^64 - 1", () => {
		expect(codec.isValid(2n ** 64n - 1n)).toBe(true);
	});

	it("accepts zero", () => {
		expect(codec.isValid(0n)).toBe(true);
	});
});
