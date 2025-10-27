import { randomBytes } from "crypto";
import { ObjectCodec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";
import { StringFixedCodec } from "../String/Fixed";
import { VarInt60Codec } from "../VarInt/VarInt60";
import { OptionalCodec } from "../Union";

describe("correctly performs object codec methods", () => {
	const codec = new ObjectCodec({
		string: new StringFixedCodec(16, "hex"),
		number: new VarInt60Codec(),
		boolean: new BooleanCodec(),
	});
	const value: CodecType<typeof codec> = {
		string: randomBytes(16).toString("hex"),
		number: 256,
		boolean: true,
	};
	const byteLength = 19;

	it("valid for object", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not object", () => {
		const isValid = codec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of object", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes object to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes object from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams object to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams object from buffer`, async () => {
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

describe("correctly handles optional properties", () => {
	const codec = new ObjectCodec({
		required: new VarInt60Codec(),
		optional: new OptionalCodec(new VarInt60Codec()),
	});

	it("validates object with missing optional property", () => {
		const value = { required: 42 };
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("validates object with undefined optional property", () => {
		const value = { required: 42, optional: undefined };
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("validates object with present optional property", () => {
		const value = { required: 42, optional: 100 };
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("encodes/decodes object with missing optional property", () => {
		const value = { required: 42 };
		const buffer = codec.encode(value);
		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
		expect("optional" in result).toBe(false);
	});

	it("encodes/decodes object with undefined optional property", () => {
		const value: CodecType<typeof codec> = { required: 42, optional: undefined };
		const buffer = codec.encode(value);
		const result = codec.decode(buffer);

		// undefined is encoded as missing
		expect(result).toStrictEqual({ required: 42 });
		expect("optional" in result).toBe(false);
	});

	it("encodes/decodes object with present optional property", () => {
		const value: CodecType<typeof codec> = { required: 42, optional: 100 };
		const buffer = codec.encode(value);
		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
		expect(result.optional).toBe(100);
	});
});

describe("correctly handles boundary values", () => {
	it("encodes/decodes object with all properties at zero/false", () => {
		const codec = new ObjectCodec({
			number: new VarInt60Codec(),
			boolean: new BooleanCodec(),
		});
		const value: CodecType<typeof codec> = {
			number: 0,
			boolean: false,
		};
		const buffer = codec.encode(value);
		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it("validates object with all properties present", () => {
		const codec = new ObjectCodec({
			a: new VarInt60Codec(),
			b: new VarInt60Codec(),
			c: new VarInt60Codec(),
		});

		const isValid = codec.isValid({ a: 1, b: 2, c: 3 });

		expect(isValid).toBe(true);
	});

	it("invalidates object with missing required property", () => {
		const codec = new ObjectCodec({
			a: new VarInt60Codec(),
			b: new VarInt60Codec(),
		});

		const isValid = codec.isValid({ a: 1 });

		expect(isValid).toBe(false);
	});

	it("invalidates object with wrong property type", () => {
		const codec = new ObjectCodec({
			a: new VarInt60Codec(),
		});

		const isValid = codec.isValid({ a: "not a number" });

		expect(isValid).toBe(false);
	});
});
