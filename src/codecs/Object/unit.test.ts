import { randomBytes } from "crypto";
import { ObjectCodec } from ".";
import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";
import { StringFixedCodec } from "../String/Fixed";
import { VarInt60Codec } from "../VarInt/VarInt60";

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

	it(`streams object from buffer`, async () => {
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
