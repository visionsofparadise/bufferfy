import { BytesReadableStream, BytesWritableStream } from "./utilities/BytesStream.ignore";
import { CommonCodec, commonValue, SpreadCodec, spreadValue } from "./utilities/TestValues.ignore";

describe("encodes and decodes spread of types", () => {
	const byteLength = 50;

	let bytes: Uint8Array | undefined;

	it("valid for spread value", () => {
		const isValid = SpreadCodec.isValid(spreadValue);

		expect(isValid).toBe(true);
	});

	it("invalid for not spread value", () => {
		const isValid = SpreadCodec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of spread value", () => {
		const resultByteLength = SpreadCodec.byteLength(spreadValue);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes spread value", () => {
		bytes = SpreadCodec.encode(spreadValue);

		expect(bytes.byteLength).toBe(byteLength);
	});

	it("decodes spread value", () => {
		const resultValue = SpreadCodec.decode(bytes!);

		expect(resultValue).toStrictEqual(spreadValue);
	});

	it(`streams spread value to bytes`, async () => {
		const stream = new BytesWritableStream();

		const encoder = SpreadCodec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(spreadValue);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams spread value from bytes`, async () => {
		const buffer = SpreadCodec.encode(spreadValue);

		const stream = new BytesReadableStream(buffer);

		const decoder = SpreadCodec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(spreadValue);
	});
});

describe("encodes and decodes common types", () => {
	const byteLength = 1050;

	let bytes: Uint8Array | undefined;

	it("valid for common value", () => {
		const isValid = CommonCodec.isValid(commonValue);

		expect(isValid).toBe(true);
	});

	it("invalid for not common value", () => {
		const isValid = CommonCodec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of common value", () => {
		const resultByteLength = CommonCodec.byteLength(commonValue);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes common value", () => {
		bytes = CommonCodec.encode(commonValue);

		expect(bytes.byteLength).toBe(byteLength);
	});

	it("decodes common value", () => {
		const resultValue = CommonCodec.decode(bytes!);

		expect(resultValue).toStrictEqual(commonValue);
	});

	it(`streams common value to bytes`, async () => {
		const stream = new BytesWritableStream();

		const encoder = CommonCodec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(commonValue);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams common value from bytes`, async () => {
		const bytes = CommonCodec.encode(commonValue);

		const stream = new BytesReadableStream(bytes);

		const decoder = CommonCodec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(commonValue);
	});
});
