import { describe, expect, it } from "vitest";
import { Int8Codec, createIntCodec } from ".";
import { BufferfyRangeError } from "../../utilities/Error";

describe("Int validation with validationMode", () => {
	describe("validationMode: both (default)", () => {
		it("validates minimum on encode", () => {
			const codec = new Int8Codec({ minimum: -50 });

			expect(() => codec.encode(-100)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(-100)).toThrow("Encoded value -100 is less than minimum -50");
		});

		it("validates maximum on encode", () => {
			const codec = new Int8Codec({ maximum: 50 });

			expect(() => codec.encode(100)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(100)).toThrow("Encoded value 100 exceeds maximum 50");
		});

		it("validates minimum on decode", () => {
			const codec = new Int8Codec({ minimum: -50 });
			const validCodec = new Int8Codec();
			const buffer = validCodec.encode(-100);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			expect(() => codec.decode(buffer)).toThrow("Decoded value -100 is less than minimum -50");
		});

		it("validates maximum on decode", () => {
			const codec = new Int8Codec({ maximum: 50 });
			const validCodec = new Int8Codec();
			const buffer = validCodec.encode(100);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			expect(() => codec.decode(buffer)).toThrow("Decoded value 100 exceeds maximum 50");
		});

		it("allows valid values on encode", () => {
			const codec = new Int8Codec({ minimum: -50, maximum: 50 });

			expect(() => codec.encode(0)).not.toThrow();
			expect(() => codec.encode(-50)).not.toThrow();
			expect(() => codec.encode(50)).not.toThrow();
		});

		it("allows valid values on decode", () => {
			const codec = new Int8Codec({ minimum: -50, maximum: 50 });
			const validCodec = new Int8Codec();

			expect(() => codec.decode(validCodec.encode(0))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(-50))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(50))).not.toThrow();
		});
	});

	describe("validationMode: encode", () => {
		it("validates minimum on encode only", () => {
			const codec = new Int8Codec({ minimum: -50, validationMode: "encode" });

			expect(() => codec.encode(-100)).toThrow(BufferfyRangeError);
		});

		it("validates maximum on encode only", () => {
			const codec = new Int8Codec({ maximum: 50, validationMode: "encode" });

			expect(() => codec.encode(100)).toThrow(BufferfyRangeError);
		});

		it("does not validate on decode", () => {
			const codec = new Int8Codec({ minimum: -50, maximum: 50, validationMode: "encode" });
			const validCodec = new Int8Codec();

			expect(() => codec.decode(validCodec.encode(-100))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(100))).not.toThrow();
		});
	});

	describe("validationMode: decode", () => {
		it("validates minimum on decode only", () => {
			const codec = new Int8Codec({ minimum: -50, validationMode: "decode" });
			const validCodec = new Int8Codec();
			const buffer = validCodec.encode(-100);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("validates maximum on decode only", () => {
			const codec = new Int8Codec({ maximum: 50, validationMode: "decode" });
			const validCodec = new Int8Codec();
			const buffer = validCodec.encode(100);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("does not validate on encode", () => {
			const codec = new Int8Codec({ minimum: -50, maximum: 50, validationMode: "decode" });

			expect(() => codec.encode(-100)).not.toThrow();
			expect(() => codec.encode(100)).not.toThrow();
		});
	});

	describe("validationMode: none", () => {
		it("does not validate on encode", () => {
			const codec = new Int8Codec({ minimum: -50, maximum: 50, validationMode: "none" });

			expect(() => codec.encode(-100)).not.toThrow();
			expect(() => codec.encode(100)).not.toThrow();
		});

		it("does not validate on decode", () => {
			const codec = new Int8Codec({ minimum: -50, maximum: 50, validationMode: "none" });
			const validCodec = new Int8Codec();

			expect(() => codec.decode(validCodec.encode(-100))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(100))).not.toThrow();
		});
	});

	describe("isValid always validates", () => {
		it("validates regardless of validationMode: none", () => {
			const codec = new Int8Codec({ minimum: -50, maximum: 50, validationMode: "none" });

			expect(codec.isValid(-100)).toBe(false);
			expect(codec.isValid(100)).toBe(false);
			expect(codec.isValid(0)).toBe(true);
		});

		it("validates regardless of validationMode: encode", () => {
			const codec = new Int8Codec({ minimum: -50, maximum: 50, validationMode: "encode" });

			expect(codec.isValid(-100)).toBe(false);
			expect(codec.isValid(100)).toBe(false);
			expect(codec.isValid(0)).toBe(true);
		});

		it("validates regardless of validationMode: decode", () => {
			const codec = new Int8Codec({ minimum: -50, maximum: 50, validationMode: "decode" });

			expect(codec.isValid(-100)).toBe(false);
			expect(codec.isValid(100)).toBe(false);
			expect(codec.isValid(0)).toBe(true);
		});
	});

	describe("works with different Int variants", () => {
		it("validates Int16BE", () => {
			const codec = createIntCodec(16, "BE", { minimum: -1000, maximum: 1000 });

			expect(() => codec.encode(-2000)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(2000)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(0)).not.toThrow();
		});

		it("validates Int16LE", () => {
			const codec = createIntCodec(16, "LE", { minimum: -1000, maximum: 1000 });

			expect(() => codec.encode(-2000)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(2000)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(0)).not.toThrow();
		});
	});
});
