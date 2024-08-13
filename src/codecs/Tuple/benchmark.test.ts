import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.Tuple([Codec.String({ length: 5 }), Codec.UInt(8), Codec.String({ length: 5 })]);

const tuple: CodecType<typeof codec> = ["test1", 27, "test3"];

it("benchmarks for tuple", () => {
	benchmark("tuple", tuple, codec);

	expect(true).toStrictEqual(true);
});
