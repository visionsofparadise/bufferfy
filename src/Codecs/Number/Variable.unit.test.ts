import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { NumberVariableCodec } from "./Variable";

describe("correctly performs bytes codec methods", () => {
	const codec = new NumberVariableCodec();
	const value: CodecType<typeof codec> = BigInt(100);
	const byteLength = 2;

	it("valid for number", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not number", () => {
		const isValid = codec.isValid(value.toString());

		expect(isValid).toBe(false);
	});

	it("returns byteLength of number", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes number to bytes", async () => {
		const bytes = codec.encode(value);

		expect(bytes.byteLength).toBe(byteLength);
	});

	it("decodes bytes from number", async () => {
		const bytes = codec.encode(value);

		const result = codec.decode(bytes);

		expect(result).toBe(value);
	});

	it(`streams number to bytes`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams bytes from number`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toBe(value);
	});
});
