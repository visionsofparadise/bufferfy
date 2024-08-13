import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.Object({
	test1: Codec.String({
		length: 5,
	}),
	test2: Codec.Null(),
	test3: Codec.UInt(8),
});

const object: CodecType<typeof codec> = {
	test1: "test1",
	test2: null,
	test3: 54,
};

it("benchmarks for object", () => {
	benchmark("object", object, codec);

	expect(true).toStrictEqual(true);
});
