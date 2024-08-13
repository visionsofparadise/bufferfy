import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.BitField(["test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9"]);

const flags: CodecType<typeof codec> = {
	test1: true,
	test2: false,
	test3: true,
	test4: true,
	test5: false,
	test6: true,
	test7: true,
	test8: false,
	test9: true,
};

it("benchmarks for bitfield", () => {
	benchmark("bitfield", flags, codec);

	expect(true).toStrictEqual(true);
});
