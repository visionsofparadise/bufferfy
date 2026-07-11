import { createTupleCodec } from "../Tuple";
import { TransformCodec } from "../Transform";
import { createUIntCodec } from "../UInt";

describe("encode shared-writer reentrancy and copy-out", () => {
	it("keeps outer and inner results correct and independent when a transform callback encodes reentrantly", () => {
		const innerCodec = createUIntCodec(32);

		let innerResult: Uint8Array | undefined;

		const outerCodec = new TransformCodec<number, number>(createUIntCodec(32), {
			encode: (value) => {
				innerResult = innerCodec.encode(0xaabbccdd);

				return value;
			},
			decode: (value) => value,
		});

		const outerResult = outerCodec.encode(0x11223344);

		expect(Array.from(outerResult)).toEqual([0x11, 0x22, 0x33, 0x44]);
		expect(Array.from(innerResult!)).toEqual([0xaa, 0xbb, 0xcc, 0xdd]);

		innerResult![0] = 0x00;

		expect(outerResult[0]).toBe(0x11);
	});

	it("does not clobber the first result with the second sequential encode", () => {
		const codec = createUIntCodec(32);

		const first = codec.encode(0x11223344);
		const second = codec.encode(0x55667788);

		expect(Array.from(first)).toEqual([0x11, 0x22, 0x33, 0x44]);
		expect(Array.from(second)).toEqual([0x55, 0x66, 0x77, 0x88]);
	});

	it("returns a result that is not aliased to the shared buffer", () => {
		const codec = createUIntCodec(32);

		const retained = codec.encode(0x01020304);
		const later = codec.encode(0x05060708);

		later[0] = 0xff;

		expect(retained[0]).toBe(0x01);
		expect(later[0]).toBe(0xff);
	});

	it("resets the shared writer after an encode throws, leaving no stale tail on the next encode", () => {
		const codec = createTupleCodec([createUIntCodec(8), createUIntCodec(8, "BE", { maximum: 10 })] as const);

		expect(() => codec.encode([0xab, 255])).toThrow();

		const result = codec.encode([0x11, 5]);

		expect(Array.from(result)).toEqual([0x11, 5]);
	});

	it("preserves the outer offset when a reentrant encode fires mid-stream", () => {
		const innerCodec = createUIntCodec(8);

		let innerResult: Uint8Array | undefined;

		const reentrantCodec = new TransformCodec<number, number>(createUIntCodec(8), {
			encode: (value) => {
				innerResult = innerCodec.encode(0x99);

				return value;
			},
			decode: (value) => value,
		});

		const codec = createTupleCodec([createUIntCodec(8), reentrantCodec, createUIntCodec(8)] as const);

		const outerResult = codec.encode([0x11, 0x22, 0x33]);

		expect(Array.from(outerResult)).toEqual([0x11, 0x22, 0x33]);
		expect(Array.from(innerResult!)).toEqual([0x99]);

		innerResult![0] = 0x00;

		expect(outerResult[0]).toBe(0x11);
	});
});
