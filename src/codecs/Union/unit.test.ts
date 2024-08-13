import { UnionCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { StringCodec } from "../String";
import { UIntCodec } from "../UInt";
import { UndefinedCodec } from "../Undefined";

const context = new Context();

const codec = new UnionCodec([new StringCodec({ length: 5 }), new UndefinedCodec()], {
	indexCodec: new UIntCodec(8),
});

const union1: CodecType<typeof codec> = "test1";
const union2: CodecType<typeof codec> = undefined;

it("matches union", () => {
	const isMatch1 = codec.match(union1, context);

	expect(isMatch1).toBe(true);

	const isMatch2 = codec.match(union2, context);

	expect(isMatch2).toBe(true);
});

it("does not match not union", () => {
	const isMatch = codec.match(null, context);

	expect(isMatch).toBe(false);
});

it("returns size of union", () => {
	const size = codec.encodingLength(union1, context);

	expect(size).toBe(6);
});

describe("encodes then decodes union value 1", () => {
	const writeStream = new Stream(Buffer.alloc(6), 0);

	it("encodes union value 1", () => {
		codec.write(union1, writeStream, context);

		expect(writeStream.position).toBe(6);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes union value 1", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(union1);
	});
});

describe("encodes then decodes union value 2", () => {
	const writeStream = new Stream(Buffer.alloc(1), 0);

	it("encodes union value 2", () => {
		codec.write(union2, writeStream, context);

		expect(writeStream.position).toBe(1);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes union value 2", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(union2);
	});
});
