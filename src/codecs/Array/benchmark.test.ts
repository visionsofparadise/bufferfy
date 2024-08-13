import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.Array(Codec.String({ length: 5 }), { lengthCodec: Codec.UInt(8) });

const array: CodecType<typeof codec> = ["test1", "test2", "test3"];

it("benchmarks for array", () => {
	benchmark("array", array, codec);

	expect(true).toStrictEqual(true);
});
