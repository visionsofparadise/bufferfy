import { Codec } from "../../Codec";

describe("union flattening behavior", () => {
	it("does not flatten by default", () => {
		const innerUnion = Codec.Union([Codec.Constant("a"), Codec.Constant("b")]);
		const outerUnion = Codec.Union([innerUnion, Codec.Constant("c")]);

		// Without flattening: [index][innerIndex][value]
		const encodedA = outerUnion.encode("a");
		const encodedC = outerUnion.encode("c");

		// Index 0 = innerUnion, then innerUnion's index 0 = "a"
		expect(encodedA.byteLength).toBe(2); // [0][0]

		// Index 1 = "c" (constant is 0 bytes)
		expect(encodedC.byteLength).toBe(1); // [1]

		expect(outerUnion.decode(encodedA)).toBe("a");
		expect(outerUnion.decode(encodedC)).toBe("c");
	});

	it("flattens when explicitly calling flatten()", () => {
		const innerUnion = Codec.Union([Codec.Constant("a"), Codec.Constant("b")]);
		const outerUnion = Codec.Union([innerUnion, Codec.Constant("c")]);
		const flatUnion = outerUnion.flatten();

		// With flattening: [index][value]
		const encodedA = flatUnion.encode("a");
		const encodedB = flatUnion.encode("b");
		const encodedC = flatUnion.encode("c");

		// All should be single index (constants are 0 bytes)
		expect(encodedA.byteLength).toBe(1); // [0]
		expect(encodedB.byteLength).toBe(1); // [1]
		expect(encodedC.byteLength).toBe(1); // [2]

		expect(flatUnion.decode(encodedA)).toBe("a");
		expect(flatUnion.decode(encodedB)).toBe("b");
		expect(flatUnion.decode(encodedC)).toBe("c");
	});

	it("does not flatten without calling flatten()", () => {
		const innerUnion = Codec.Union([Codec.Constant("a"), Codec.Constant("b")]);
		const outerUnion = Codec.Union([innerUnion, Codec.Constant("c")]);

		// Without calling flatten(), stays nested
		const encodedA = outerUnion.encode("a");

		// Still nested: [0][0]
		expect(encodedA.byteLength).toBe(2);
	});

	it("OptionalCodec automatically flattens nested unions for space efficiency", () => {
		// Optional(Union([A, B])) should automatically flatten to Union([A, B, Undefined])
		const innerUnion = Codec.Union([Codec.String(undefined, 1), Codec.UInt(8)]);
		const optionalUnion = Codec.Optional(innerUnion);

		const encodedString = optionalUnion.encode("x");
		const encodedNumber = optionalUnion.encode(5);
		const encodedUndefined = optionalUnion.encode(undefined);

		// Should all be single-level: [index][value]
		// String: index + 1 byte
		expect(encodedString.byteLength).toBe(2);
		// Number: index + 1 byte
		expect(encodedNumber.byteLength).toBe(2);
		// Undefined: index only (constant is 0 bytes)
		expect(encodedUndefined.byteLength).toBe(1);

		expect(optionalUnion.decode(encodedString)).toBe("x");
		expect(optionalUnion.decode(encodedNumber)).toBe(5);
		expect(optionalUnion.decode(encodedUndefined)).toBe(undefined);
	});
});
