import { AnyCodec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";

describe("correctly performs any codec methods", () => {
	const codec = new AnyCodec();
	const value: CodecType<typeof codec> = {
		test1: true,
		test2: false,
	};
	const byteLength = 29;

	it("valid for any", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of any", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes any to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes any from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams any to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams any from buffer`, async () => {
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
