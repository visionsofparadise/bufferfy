import { hex } from "@scure/base";
import { randomBytes } from "crypto";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "./Fixed";

describe("correctly performs fixed string codec methods", () => {
	const byteLength = 16;
	const codec = new StringFixedCodec(16, "hex");
	const value: CodecType<typeof codec> = hex.encode(randomBytes(16));

	it("valid for fixed string", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not fixed string", () => {
		const isValid = codec.isValid(null);

		expect(isValid).toBe(false);
	});

	it("returns byteLength of fixed string", () => {
		const resultByteLength = codec.byteLength();

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes fixed string to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes buffer from fixed string", async () => {
		const buffer = hex.decode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams fixed string to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams fixed string from buffer`, async () => {
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
