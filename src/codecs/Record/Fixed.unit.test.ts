import { randomBytes } from "crypto";
import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";
import { RecordFixedCodec } from "./Fixed";

describe("correctly performs fixed record codec methods", () => {
	const codec = new RecordFixedCodec(100, new StringFixedCodec(4, "hex"), new StringFixedCodec(16, "hex"));
	const entries = Array(100)
		.fill(undefined)
		.map(() => [randomBytes(4).toString("hex"), randomBytes(16).toString("hex")]);
	const value: CodecType<typeof codec> = Object.fromEntries(entries);
	const byteLength = 2000;

	it("valid for fixed record", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not fixed record", () => {
		const isValid = codec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of fixed record", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes fixed record to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes fixed record from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams fixed record to buffer`, async () => {
		const stream = new BufferWriteStream();

		const encoder = codec.Encoder();

		await new Promise((resolve) => {
			stream.on("finish", resolve);

			encoder.pipe(stream);
			encoder.write(value);
			encoder.end();
		});

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams fixed record from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toStrictEqual(value);
	});
});
