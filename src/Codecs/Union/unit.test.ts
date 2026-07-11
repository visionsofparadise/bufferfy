import { randomBytes } from "crypto";
import { UnionCodec } from ".";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { AnyCodec } from "../Any";
import { ArrayVariableCodec } from "../Array/Variable";
import { ConstantCodec, DeepConstantCodec } from "../Constant";
import { ObjectCodec } from "../Object";
import { RecordVariableCodec } from "../Record/Variable";
import { StringFixedCodec } from "../String/Fixed";
import { StringVariableCodec } from "../String/Variable";
import { UInt8Codec } from "../UInt";

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

// Encode-selection sufficiency: a non-exact matcher skips deep `isValid` only when no later branch overlaps its
// test domain. These pin fall-through where an overlap exists, and the frozen wire format / deliberate GIGO where it does not.
describe("union encode-selection sufficiency", () => {
	// (a) Overlapping object branches (object → object) stay insufficient: a value valid only for the second object
	// branch must fall through the first, so deep validation is retained.
	it("selects the second object branch for a value invalid for the first", () => {
		const codec = new UnionCodec([new ObjectCodec({ a: new UInt8Codec() }), new ObjectCodec({ b: new StringVariableCodec("utf8", new UInt8Codec()) })]);
		const value = { b: "hi" };

		expect(codec.encode(value)[0]).toBe(1);
		expect(codec.decode(codec.encode(value))).toStrictEqual(value);
	});

	// (b) A trailing Any (accept-domain "any") keeps every earlier branch insufficient: an empty object passes the
	// object test but fails the object branch's isValid, so it falls through to Any.
	it("routes a value invalid for the object branch to a trailing Any", () => {
		const codec = new UnionCodec([new ObjectCodec({ a: new UInt8Codec() }), new AnyCodec()]);
		const value = {};

		expect(codec.encode(value)[0]).toBe(1);
		expect(codec.decode(codec.encode(value))).toStrictEqual(value);
	});

	// (c) A trailing DeepConstant whose value passes the object test keeps the object branch insufficient; a deep-equal
	// literal falls through the object branch and selects the constant.
	it("selects a trailing DeepConstant branch for a deep-equal literal", () => {
		const codec = new UnionCodec([new ObjectCodec({ a: new UInt8Codec() }), new DeepConstantCodec({ x: 1 })]);
		const value = { x: 1 };

		expect(codec.encode(value)[0]).toBe(1);
		expect(codec.decode(codec.encode(value))).toStrictEqual(value);
	});

	// (d) object → Null is sufficient (Null's value fails the object test): the object branch skips isValid, and the
	// wire format for valid values is frozen — identical bytes to the pre-sufficiency selection.
	it("freezes the wire format for object|Null valid values", () => {
		const codec = new UnionCodec([new ObjectCodec({ a: new UInt8Codec() }), new ConstantCodec(null)]);

		expect(Array.from(codec.encode({ a: 5 }))).toStrictEqual([0, 5]);
		expect(Array.from(codec.encode(null))).toStrictEqual([1]);
		expect(codec.decode(codec.encode({ a: 5 }))).toStrictEqual({ a: 5 });
		expect(codec.decode(codec.encode(null))).toBe(null);
	});

	// (e) Deliberate garbage-in-garbage-out: with object → Null sufficient, an invalid value passing the shallow
	// object test now encodes through the object branch instead of throwing. `{}` writes UInt8 of undefined (0).
	// encode() documents no validation; isValid() still rejects. Signed off by Matt 2026-07-11.
	it("encodes an invalid value through a sufficient object branch (GIGO)", () => {
		const codec = new UnionCodec([new ObjectCodec({ a: new UInt8Codec() }), new ConstantCodec(null)]);

		expect(Array.from(codec.encode({} as any))).toStrictEqual([0, 0]);
		expect(codec.isValid({})).toBe(false);
	});

	// (f) Symmetric object overlap: array → Record stays insufficient because Record accepts arrays
	// (`Record(String, String).isValid(["x"])` is true). An array valid for the Record must fall through the Array branch.
	it("selects a trailing Record branch for an array the Array branch rejects", () => {
		const codec = new UnionCodec([new ArrayVariableCodec(new UInt8Codec()), new RecordVariableCodec(new StringVariableCodec("utf8", new UInt8Codec()), new StringVariableCodec("utf8", new UInt8Codec()))]);
		// `["x"]` is valid only for the Record branch (string element); invalid for the UInt8 array branch. The cast passes that intentionally-invalid-for-array edge value.
		const value = ["x"] as any;

		expect(codec.encode(value)[0]).toBe(1);
	});
});
