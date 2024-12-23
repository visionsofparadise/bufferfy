import { randomBytes } from "crypto";
import { pickObjectCodec } from ".";
import { ObjectCodec } from "..";
import { BytesReadableStream, BytesWritableStream } from "../../../utilities/BytesStream.ignore";
import { CodecType } from "../../Abstract";
import { BooleanCodec } from "../../Boolean";
import { StringFixedCodec } from "../../String/Fixed";
import { VarInt60Codec } from "../../VarInt/VarInt60";

describe("correctly performs picked object codec methods", () => {
	const codec = pickObjectCodec(
		new ObjectCodec({
			string: new StringFixedCodec(16, "hex"),
			number: new VarInt60Codec(),
			boolean: new BooleanCodec(),
		}),
		["string", "number"]
	);
	const value: CodecType<typeof codec> = {
		string: randomBytes(16).toString("hex"),
		number: 256,
	};
	const byteLength = 18;

	it("valid for picked object", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not picked object", () => {
		const isValid = codec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of picked object", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes picked object to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes picked object from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams picked object to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams picked object from buffer`, async () => {
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
