import { BooleanCodec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";

describe("correctly performs boolean codec methods", () => {
	const codec = new BooleanCodec();
	const value = true;
	const byteLength = 1;

	it("valid for boolean", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not boolean", () => {
		const isValid = codec.isValid(null);

		expect(isValid).toBe(false);
	});

	it("returns byteLength of boolean", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes boolean to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes boolean from buffer", async () => {
		const result = codec.decode(Uint8Array.from([1]));

		expect(result).toStrictEqual(value);
	});

	it(`streams boolean to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams boolean from buffer`, async () => {
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
