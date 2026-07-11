import { BitFieldCodec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";

describe("correctly performs bitfield codec methods", () => {
	const codec = new BitFieldCodec(["test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9"]);
	const value: CodecType<typeof codec> = {
		test1: true,
		test2: false,
		test3: true,
		test4: true,
		test5: false,
		test6: true,
		test7: true,
		test8: false,
		test9: true,
	};
	const byteLength = 2;

	it("valid for bitfield", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not bitfield", () => {
		const isValid = codec.isValid(null);

		expect(isValid).toBe(false);
	});

	it("returns byteLength of bitfield", () => {
		const resultByteLength = codec.byteLength();

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes bitfield to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes bitfield from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams bitfield to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams bitfield from buffer`, async () => {
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

describe("bitfield multi-byte and partial final byte exact-byte guards", () => {
	const keys = ["k0", "k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "k9"];

	it("packs 10 keys into 2 bytes with a partial final byte", () => {
		const codec = new BitFieldCodec(keys);

		expect(codec.byteLength()).toBe(2);

		const value = {
			k0: true,
			k1: false,
			k2: false,
			k3: true,
			k4: false,
			k5: false,
			k6: false,
			k7: true,
			k8: true,
			k9: false,
		};

		expect(codec.encode(value)).toEqual(Uint8Array.from([0x91, 0x80]));
		expect(codec.decode(codec.encode(value))).toStrictEqual(value);
	});

	it("encodes the last flag of a partial final byte in its own bit position", () => {
		const codec = new BitFieldCodec(keys);

		const value = {
			k0: false,
			k1: false,
			k2: false,
			k3: false,
			k4: false,
			k5: false,
			k6: false,
			k7: false,
			k8: false,
			k9: true,
		};

		expect(codec.encode(value)).toEqual(Uint8Array.from([0x00, 0x40]));
		expect(codec.decode(codec.encode(value))).toStrictEqual(value);
	});
});
