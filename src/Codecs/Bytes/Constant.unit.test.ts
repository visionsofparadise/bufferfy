import { compare } from "uint8array-tools";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { BytesConstantCodec } from "./Constant";

describe("correctly performs bytes codec methods", () => {
	const value = new Uint8Array(16).fill(0);
	const codec = new BytesConstantCodec(value);
	const byteLength = value.byteLength;

	it("valid for bytes", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not bytes", () => {
		const isValid = codec.isValid(value.toString());

		expect(isValid).toBe(false);
	});

	it("returns byteLength of bytes", () => {
		const resultByteLength = codec.byteLength();

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes bytes to bytes", async () => {
		const bytes = codec.encode(value);

		expect(bytes.byteLength).toBe(byteLength);
	});

	it("decodes bytes from bytes", async () => {
		const bytes = codec.encode(value);

		const result = codec.decode(bytes);

		expect(compare(bytes, result)).toBe(0);
	});

	it(`streams bytes to bytes`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams bytes from bytes`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(compare(result.value!, value)).toBe(0);
	});
});
