export type DomainTag = "boolean" | "string" | "number" | "bigint" | "bytes" | "array" | "object" | "null" | "undefined" | "any";

export interface CodecMatcher {
	test(value: unknown): boolean;
	exact: boolean;
	testTag: DomainTag;
	acceptTag: DomainTag;
}

export const TAG_OVERLAP: Record<DomainTag, ReadonlyArray<DomainTag>> = {
	boolean: ["boolean"],
	string: ["string"],
	number: ["number"],
	bigint: ["bigint"],
	bytes: ["bytes", "object"],
	array: ["array", "object"],
	object: ["object", "array", "bytes"],
	null: ["null"],
	undefined: ["undefined"],
	any: ["boolean", "string", "number", "bigint", "bytes", "array", "object", "null", "undefined", "any"],
};

export const domainOf = (value: unknown): DomainTag => {
	if (value === null) return "null";
	if (value === undefined) return "undefined";

	const type = typeof value;

	if (type === "boolean") return "boolean";
	if (type === "string") return "string";
	if (type === "number") return "number";
	if (type === "bigint") return "bigint";

	if (Array.isArray(value)) return "array";
	if (value instanceof Uint8Array) return "bytes";
	if (type === "object") return "object";

	return "any";
};

export const FALLBACK_MATCHER: CodecMatcher = Object.freeze({ test: () => true, exact: false, testTag: "any", acceptTag: "any" });

export const NUMBER_MATCHER: CodecMatcher = Object.freeze({ test: (value: unknown) => typeof value === "number", exact: false, testTag: "number", acceptTag: "number" });

export const BIGINT_MATCHER: CodecMatcher = Object.freeze({ test: (value: unknown) => typeof value === "bigint", exact: false, testTag: "bigint", acceptTag: "bigint" });

export const BYTES_MATCHER: CodecMatcher = Object.freeze({ test: (value: unknown) => value instanceof Uint8Array, exact: false, testTag: "bytes", acceptTag: "bytes" });

export const ARRAY_MATCHER: CodecMatcher = Object.freeze({ test: (value: unknown) => Array.isArray(value), exact: false, testTag: "array", acceptTag: "array" });

export const OBJECT_MATCHER: CodecMatcher = Object.freeze({ test: (value: unknown) => typeof value === "object" && value !== null, exact: false, testTag: "object", acceptTag: "object" });

export const STRING_MATCHER: CodecMatcher = Object.freeze({ test: (value: unknown) => typeof value === "string", exact: true, testTag: "string", acceptTag: "string" });

export const BOOLEAN_MATCHER: CodecMatcher = Object.freeze({ test: (value: unknown) => typeof value === "boolean", exact: true, testTag: "boolean", acceptTag: "boolean" });
