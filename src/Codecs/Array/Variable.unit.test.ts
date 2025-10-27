import { randomBytes } from "crypto";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { ArrayVariableCodec } from "./Variable";

describe("correctly performs variable array codec methods", () => {
	const codec = new ArrayVariableCodec(new StringFixedCodec(16, "hex"));
	const value: CodecType<typeof codec> = Array(100)
		.fill(undefined)
		.map(() => randomBytes(16).toString("hex"));
	const byteLength = 1602;

	it("valid for variable array", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not variable array", () => {
		const isValid = codec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of variable array", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes variable array to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes variable array from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams variable array to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams variable array from buffer`, async () => {
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

describe("correctly handles boundary values", () => {
	const codec = new ArrayVariableCodec(new StringFixedCodec(16, "hex"));

	it("encodes/decodes empty array", () => {
		const value: CodecType<typeof codec> = [];
		const buffer = codec.encode(value);
		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
		expect(result.length).toBe(0);
	});

	it("encodes/decodes single item array", () => {
		const value: CodecType<typeof codec> = [randomBytes(16).toString("hex")];
		const buffer = codec.encode(value);
		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
		expect(result.length).toBe(1);
	});

	it("validates empty array", () => {
		const isValid = codec.isValid([]);

		expect(isValid).toBe(true);
	});

	it("invalidates array with invalid items", () => {
		const isValid = codec.isValid(["invalid", 123, null]);

		expect(isValid).toBe(false);
	});
});
