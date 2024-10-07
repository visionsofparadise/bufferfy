import { randomBytes } from "crypto";
import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "./Fixed";

describe("correctly performs fixed string codec methods", () => {
	const byteLength = 16;
	const codec = new StringFixedCodec(16, "hex");
	const value: CodecType<typeof codec> = randomBytes(16).toString("hex");

	it("valid for fixed string", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not fixed string", () => {
		const isValid = codec.isValid(Buffer.from(value));

		expect(isValid).toBe(false);
	});

	it("returns byteLength of fixed string", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes fixed string to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes buffer from fixed string", async () => {
		const buffer = Buffer.from(value, "hex");

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams fixed string to buffer`, async () => {
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

	it(`streams fixed string from buffer`, async () => {
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
