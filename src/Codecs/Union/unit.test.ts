import { randomBytes } from "crypto";
import { UnionCodec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { ObjectCodec } from "../Object";
import { StringFixedCodec } from "../String/Fixed";

describe("correctly performs union codec methods", () => {
	const codec = new UnionCodec([
		new StringFixedCodec(16, "hex"),
		new ObjectCodec({
			test1: new StringFixedCodec(16, "hex"),
		}),
	]);
	const value1: CodecType<typeof codec> = randomBytes(16).toString("hex");
	const byteLength1 = 17;
	const value2: CodecType<typeof codec> = {
		test1: randomBytes(16).toString("hex"),
	};
	const byteLength2 = 17;

	it("valid for union value1", () => {
		const isValid = codec.isValid(value1);

		expect(isValid).toBe(true);
	});

	it("invalid for not union value1", () => {
		const isValid = codec.isValid(null);

		expect(isValid).toBe(false);
	});

	it("returns byteLength of union value1", () => {
		const resultByteLength = codec.byteLength(value1);

		expect(resultByteLength).toBe(byteLength1);
	});

	it("encodes union value1 to buffer", async () => {
		const buffer = codec.encode(value1);

		expect(buffer.byteLength).toBe(byteLength1);
	});

	it("decodes union value1 from buffer", async () => {
		const buffer = codec.encode(value1);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value1);
	});

	it(`streams union value1 to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value1);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength1);
	});

	it(`streams union value1 from buffer`, async () => {
		const buffer = codec.encode(value1);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value1);
	});

	it("valid for union value2", () => {
		const isValid = codec.isValid(value2);

		expect(isValid).toBe(true);
	});

	it("returns byteLength of union value2", () => {
		const resultByteLength = codec.byteLength(value2);

		expect(resultByteLength).toBe(byteLength2);
	});

	it("encodes union value2 to buffer", async () => {
		const buffer = codec.encode(value2);

		expect(buffer.byteLength).toBe(byteLength2);
	});

	it("decodes union value2 from buffer", async () => {
		const buffer = codec.encode(value2);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value2);
	});

	it(`streams union value2 to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value2);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength2);
	});

	it(`streams union value2 from buffer`, async () => {
		const buffer = codec.encode(value2);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value2);
	});
});
