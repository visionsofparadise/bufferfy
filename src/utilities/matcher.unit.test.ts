import { domainOf, TAG_OVERLAP, type DomainTag } from "./matcher";

describe("domainOf classifies values into their domain tag", () => {
	const cases: Array<[string, unknown, DomainTag]> = [
		["boolean", true, "boolean"],
		["string", "x", "string"],
		["number", 1, "number"],
		["bigint", 1n, "bigint"],
		["bytes", new Uint8Array(1), "bytes"],
		["array", [1, 2], "array"],
		["object", { a: 1 }, "object"],
		["null", null, "null"],
		["undefined", undefined, "undefined"],
		["any", Symbol("x"), "any"],
	];

	for (const [name, value, expected] of cases) {
		it(`classifies ${name} as "${expected}"`, () => {
			expect(domainOf(value)).toBe(expected);
		});
	}
});

describe("TAG_OVERLAP encodes structural containment", () => {
	it("object overlaps array and bytes symmetrically", () => {
		expect(TAG_OVERLAP.object).toContain("array");
		expect(TAG_OVERLAP.object).toContain("bytes");
		expect(TAG_OVERLAP.array).toContain("object");
		expect(TAG_OVERLAP.bytes).toContain("object");
	});

	it("null and undefined map to themselves only and appear in no other row", () => {
		expect(TAG_OVERLAP.null).toEqual(["null"]);
		expect(TAG_OVERLAP.undefined).toEqual(["undefined"]);

		for (const [tag, overlaps] of Object.entries(TAG_OVERLAP) as Array<[DomainTag, ReadonlyArray<DomainTag>]>) {
			if (tag === "null" || tag === "any") continue;

			expect(overlaps).not.toContain("null");
		}

		for (const [tag, overlaps] of Object.entries(TAG_OVERLAP) as Array<[DomainTag, ReadonlyArray<DomainTag>]>) {
			if (tag === "undefined" || tag === "any") continue;

			expect(overlaps).not.toContain("undefined");
		}
	});
});
