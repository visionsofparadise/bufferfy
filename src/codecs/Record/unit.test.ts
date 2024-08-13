import { RecordCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { StringCodec } from "../String";
import { UIntCodec } from "../UInt";

const context = new Context();

const codec = new RecordCodec(new StringCodec({ length: 5 }), new StringCodec({ length: 5 }), {
	lengthCodec: new UIntCodec(8),
});

const record: CodecType<typeof codec> = {
	test1: "test1",
	test2: "test2",
	test3: "test3",
};

it("matches record", () => {
	const isMatch = codec.match(record, context);

	expect(isMatch).toBe(true);
});

it("does not match not record", () => {
	const isMatch = codec.match(10, context);

	expect(isMatch).toBe(false);
});

it("returns size of record", () => {
	const size = codec.encodingLength(record, context);

	expect(size).toBe(31);
});

describe("encodes then decodes record", () => {
	const writeStream = new Stream(Buffer.alloc(31), 0);

	it("encodes record", () => {
		codec.write(record, writeStream, context);

		expect(writeStream.position).toBe(31);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes record", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(record);
	});
});
