import { randomBytes } from "crypto";
import { mergeObjectCodecs } from ".";
import { ObjectCodec } from "..";
import { BufferReadStream, BufferWriteStream } from "../../../utilities/BufferStream.ignore";
import { CodecType } from "../../Abstract";
import { BooleanCodec } from "../../Boolean";
import { StringFixedCodec } from "../../String/Fixed";
import { VarInt60Codec } from "../../VarInt/VarInt60";

describe("correctly performs merged object codec methods", () => {
	const codecA = new ObjectCodec({
		string: new StringFixedCodec(16, "hex"),
		number: new VarInt60Codec(),
	});
	const codecB = new ObjectCodec({
		boolean: new BooleanCodec(),
	});
	const codec = mergeObjectCodecs([codecA, codecB]);
	const value: CodecType<typeof codec> = {
		string: randomBytes(16).toString("hex"),
		number: 256,
		boolean: true,
	};
	const byteLength = 19;

	it("valid for merged object", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not merged object", () => {
		const isValid = codec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of merged object", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes merged object to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes merged object from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams merged object to buffer`, async () => {
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

	it(`streams merged object from buffer`, async () => {
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
