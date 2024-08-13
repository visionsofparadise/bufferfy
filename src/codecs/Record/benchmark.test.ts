import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.Record(Codec.String({ length: 5 }), Codec.String({ length: 5 }), {
	lengthCodec: Codec.UInt(8),
});

const record: CodecType<typeof codec> = {
	test1: "test1",
	test2: "test2",
	test3: "test3",
};

it("benchmarks for record", () => {
	benchmark("record", record, codec);

	expect(true).toStrictEqual(true);
});
