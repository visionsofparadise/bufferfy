import { randomBytes } from "crypto";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { RecordVariableCodec } from "./Variable";

describe("correctly performs variable record codec methods", () => {
	const codec = new RecordVariableCodec(new StringFixedCodec(4, "hex"), new StringFixedCodec(16, "hex"));
	const entries = Array(100)
		.fill(undefined)
		.map(() => [randomBytes(4).toString("hex"), randomBytes(16).toString("hex")]);
	const value: CodecType<typeof codec> = Object.fromEntries(entries);
	const byteLength = 2002;

	it("valid for variable record", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not variable record", () => {
		const isValid = codec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of variable record", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes variable record to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes variable record from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams variable record to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams variable record from buffer`, async () => {
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
	const codec = new RecordVariableCodec(new StringFixedCodec(4, "hex"), new StringFixedCodec(16, "hex"));

	it("encodes/decodes empty record", () => {
		const value: CodecType<typeof codec> = {};
		const buffer = codec.encode(value);
		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
		expect(Object.keys(result).length).toBe(0);
	});

	it("encodes/decodes single entry record", () => {
		const value: CodecType<typeof codec> = {
			[randomBytes(4).toString("hex")]: randomBytes(16).toString("hex"),
		};
		const buffer = codec.encode(value);
		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
		expect(Object.keys(result).length).toBe(1);
	});

	it("validates empty record", () => {
		const isValid = codec.isValid({});

		expect(isValid).toBe(true);
	});

	it("invalidates record with invalid value", () => {
		const isValid = codec.isValid({ [randomBytes(4).toString("hex")]: 123 });

		expect(isValid).toBe(false);
	});
});
