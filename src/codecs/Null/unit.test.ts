import { NullCodec } from ".";
import { Context } from "../../utilities/Context";

const context = new Context();

const codec = new NullCodec();

it("matches null", () => {
	const isMatch = codec.match(null, context);

	expect(isMatch).toBe(true);
});

it("does not match not null", () => {
	const isMatch = codec.match(undefined, context);

	expect(isMatch).toBe(false);
});

it("returns size of null", () => {
	const size = codec.encodingLength(null, context);

	expect(size).toBe(0);
});

describe("encodes then decodes null", () => {
	it("encodes null", () => {
		codec.write(null, {} as any, context);

		expect(true).toBe(true);
	});

	it("decodes null", () => {
		const value = codec.read({} as any, context);

		expect(value).toBe(null);
	});
});
