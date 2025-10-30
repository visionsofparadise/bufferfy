import { describe, expect, it } from "vitest";
import { createVarIntCodec } from ".";
import { BufferfyRangeError } from "../../utilities/Error";

describe("VarInt validation with validationMode", () => {
	describe("VarInt15Codec", () => {
		describe("validationMode: both (default)", () => {
			it("validates minimum on encode", () => {
				const codec = createVarIntCodec(15,{ minimum: 100 });

				expect(() => codec.encode(50)).toThrow(BufferfyRangeError);
				expect(() => codec.encode(50)).toThrow("Encoded value 50 is less than minimum 100");
			});

			it("validates maximum on encode", () => {
				const codec = createVarIntCodec(15,{ maximum: 1000 });

				expect(() => codec.encode(1500)).toThrow(BufferfyRangeError);
				expect(() => codec.encode(1500)).toThrow("Encoded value 1500 exceeds maximum 1000");
			});

			it("validates minimum on decode", () => {
				const codec = createVarIntCodec(15,{ minimum: 100 });
				const validCodec = createVarIntCodec(15);
				const buffer = validCodec.encode(50);

				expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
				expect(() => codec.decode(buffer)).toThrow("Decoded value 50 is less than minimum 100");
			});

			it("validates maximum on decode", () => {
				const codec = createVarIntCodec(15,{ maximum: 1000 });
				const validCodec = createVarIntCodec(15);
				const buffer = validCodec.encode(1500);

				expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
				expect(() => codec.decode(buffer)).toThrow("Decoded value 1500 exceeds maximum 1000");
			});

			it("allows valid values", () => {
				const codec = createVarIntCodec(15,{ minimum: 100, maximum: 1000 });

				expect(() => codec.encode(500)).not.toThrow();
				expect(() => codec.encode(100)).not.toThrow();
				expect(() => codec.encode(1000)).not.toThrow();
			});
		});

		describe("validationMode: encode", () => {
			it("validates on encode only", () => {
				const codec = createVarIntCodec(15,{ minimum: 100, maximum: 1000, validationMode: "encode" });

				expect(() => codec.encode(50)).toThrow(BufferfyRangeError);
				expect(() => codec.encode(1500)).toThrow(BufferfyRangeError);
			});

			it("does not validate on decode", () => {
				const codec = createVarIntCodec(15,{ minimum: 100, maximum: 1000, validationMode: "encode" });
				const validCodec = createVarIntCodec(15);

				expect(() => codec.decode(validCodec.encode(50))).not.toThrow();
				expect(() => codec.decode(validCodec.encode(1500))).not.toThrow();
			});
		});

		describe("validationMode: decode", () => {
			it("validates on decode only", () => {
				const codec = createVarIntCodec(15,{ minimum: 100, maximum: 1000, validationMode: "decode" });
				const validCodec = createVarIntCodec(15);

				expect(() => codec.decode(validCodec.encode(50))).toThrow(BufferfyRangeError);
				expect(() => codec.decode(validCodec.encode(1500))).toThrow(BufferfyRangeError);
			});

			it("does not validate on encode", () => {
				const codec = createVarIntCodec(15,{ minimum: 100, maximum: 1000, validationMode: "decode" });

				expect(() => codec.encode(50)).not.toThrow();
				expect(() => codec.encode(1500)).not.toThrow();
			});
		});

		describe("validationMode: none", () => {
			it("does not validate on encode or decode", () => {
				const codec = createVarIntCodec(15,{ minimum: 100, maximum: 1000, validationMode: "none" });
				const validCodec = createVarIntCodec(15);

				expect(() => codec.encode(50)).not.toThrow();
				expect(() => codec.encode(1500)).not.toThrow();
				expect(() => codec.decode(validCodec.encode(50))).not.toThrow();
				expect(() => codec.decode(validCodec.encode(1500))).not.toThrow();
			});
		});

		describe("isValid always validates", () => {
			it("validates regardless of validationMode", () => {
				const codec = createVarIntCodec(15,{ minimum: 100, maximum: 1000, validationMode: "none" });

				expect(codec.isValid(50)).toBe(false);
				expect(codec.isValid(1500)).toBe(false);
				expect(codec.isValid(500)).toBe(true);
			});
		});
	});

	describe("VarInt30Codec", () => {
		describe("validationMode: both (default)", () => {
			it("validates minimum on encode", () => {
				const codec = createVarIntCodec(30,{ minimum: 10000 });

				expect(() => codec.encode(5000)).toThrow(BufferfyRangeError);
			});

			it("validates maximum on encode", () => {
				const codec = createVarIntCodec(30,{ maximum: 100000 });

				expect(() => codec.encode(150000)).toThrow(BufferfyRangeError);
			});

			it("validates minimum on decode", () => {
				const codec = createVarIntCodec(30,{ minimum: 10000 });
				const validCodec = createVarIntCodec(30);
				const buffer = validCodec.encode(5000);

				expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			});

			it("validates maximum on decode", () => {
				const codec = createVarIntCodec(30,{ maximum: 100000 });
				const validCodec = createVarIntCodec(30);
				const buffer = validCodec.encode(150000);

				expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			});

			it("allows valid values", () => {
				const codec = createVarIntCodec(30,{ minimum: 10000, maximum: 100000 });

				expect(() => codec.encode(50000)).not.toThrow();
			});
		});

		describe("validationMode: encode", () => {
			it("validates on encode only", () => {
				const codec = createVarIntCodec(30,{ minimum: 10000, validationMode: "encode" });

				expect(() => codec.encode(5000)).toThrow(BufferfyRangeError);
			});

			it("does not validate on decode", () => {
				const codec = createVarIntCodec(30,{ minimum: 10000, validationMode: "encode" });
				const validCodec = createVarIntCodec(30);

				expect(() => codec.decode(validCodec.encode(5000))).not.toThrow();
			});
		});

		describe("validationMode: decode", () => {
			it("validates on decode only", () => {
				const codec = createVarIntCodec(30,{ minimum: 10000, validationMode: "decode" });
				const validCodec = createVarIntCodec(30);

				expect(() => codec.decode(validCodec.encode(5000))).toThrow(BufferfyRangeError);
			});

			it("does not validate on encode", () => {
				const codec = createVarIntCodec(30,{ minimum: 10000, validationMode: "decode" });

				expect(() => codec.encode(5000)).not.toThrow();
			});
		});

		describe("isValid always validates", () => {
			it("validates regardless of validationMode", () => {
				const codec = createVarIntCodec(30,{ minimum: 10000, validationMode: "none" });

				expect(codec.isValid(5000)).toBe(false);
				expect(codec.isValid(50000)).toBe(true);
			});
		});
	});

	describe("VarInt60Codec", () => {
		describe("validationMode: both (default)", () => {
			it("validates minimum on encode", () => {
				const codec = createVarIntCodec(60,{ minimum: 100000 });

				expect(() => codec.encode(50000)).toThrow(BufferfyRangeError);
			});

			it("validates maximum on encode", () => {
				const codec = createVarIntCodec(60,{ maximum: 1000000 });

				expect(() => codec.encode(1500000)).toThrow(BufferfyRangeError);
			});

			it("validates minimum on decode", () => {
				const codec = createVarIntCodec(60,{ minimum: 100000 });
				const validCodec = createVarIntCodec(60);
				const buffer = validCodec.encode(50000);

				expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			});

			it("validates maximum on decode", () => {
				const codec = createVarIntCodec(60,{ maximum: 1000000 });
				const validCodec = createVarIntCodec(60);
				const buffer = validCodec.encode(1500000);

				expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			});

			it("allows valid values", () => {
				const codec = createVarIntCodec(60,{ minimum: 100000, maximum: 1000000 });

				expect(() => codec.encode(500000)).not.toThrow();
			});
		});

		describe("validationMode: encode", () => {
			it("validates on encode only", () => {
				const codec = createVarIntCodec(60,{ minimum: 100000, validationMode: "encode" });

				expect(() => codec.encode(50000)).toThrow(BufferfyRangeError);
			});

			it("does not validate on decode", () => {
				const codec = createVarIntCodec(60,{ minimum: 100000, validationMode: "encode" });
				const validCodec = createVarIntCodec(60);

				expect(() => codec.decode(validCodec.encode(50000))).not.toThrow();
			});
		});

		describe("validationMode: decode", () => {
			it("validates on decode only", () => {
				const codec = createVarIntCodec(60,{ minimum: 100000, validationMode: "decode" });
				const validCodec = createVarIntCodec(60);

				expect(() => codec.decode(validCodec.encode(50000))).toThrow(BufferfyRangeError);
			});

			it("does not validate on encode", () => {
				const codec = createVarIntCodec(60,{ minimum: 100000, validationMode: "decode" });

				expect(() => codec.encode(50000)).not.toThrow();
			});
		});

		describe("isValid always validates", () => {
			it("validates regardless of validationMode", () => {
				const codec = createVarIntCodec(60,{ minimum: 100000, validationMode: "none" });

				expect(codec.isValid(50000)).toBe(false);
				expect(codec.isValid(500000)).toBe(true);
			});
		});
	});
});
