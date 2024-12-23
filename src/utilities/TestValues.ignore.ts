import { randomBytes } from "crypto";
import { Codec } from "../Codec";

export const SpreadCodec = Codec.Object({
	any: Codec.Any(),
	array: Codec.Array(Codec.BitField(["test1", "test2", "test3", "test4", "test5", "test6", "test7"]), Codec.UInt(8)),
	boolean: Codec.Boolean,
	buffer: Codec.Bytes(1),
	constant: Codec.Constant("test"),
	enumerated: Codec.Enum(["test1", "test2"], Codec.UInt(8)),
	null: Codec.Null,
	record: Codec.Record(Codec.String("utf8", 5), Codec.String("utf8", 4), Codec.UInt(32)),
	transform: Codec.Transform(Codec.String("utf8", 2), { encode: (value: number) => value.toString(10), decode: (value) => parseInt(value) }),
	tuple: Codec.Tuple([Codec.UInt(8), Codec.Null]),
	undefined: Codec.Undefined,
});

type SpreadValue = Codec.Type<typeof SpreadCodec>;

export const spreadValue: SpreadValue = {
	any: {
		test1: true,
		test2: false,
	},
	array: [
		{
			test1: true,
			test2: true,
			test3: false,
			test4: true,
			test5: true,
			test6: false,
			test7: true,
		},
	],
	boolean: true,
	buffer: Uint8Array.from([1]),
	constant: "test",
	enumerated: "test2",
	null: null,
	record: {
		test1: "test",
	},
	transform: 27,
	tuple: [1, null],
	undefined: undefined,
};

export const CommonCodec = Codec.Object({
	id: Codec.String("hex", 32),
	ids: Codec.Array(Codec.String("hex", 32)),
	records: Codec.Record(
		Codec.String("utf8", Codec.UInt(8)),
		Codec.Union(
			[
				Codec.Object({
					id: Codec.String("hex", 32),
					title: Codec.String("utf8", Codec.VarInt(15)),
					description: Codec.Optional(Codec.String("utf8", Codec.VarInt(15))),
					children: Codec.Array(Codec.String("hex", 32), Codec.UInt(8)),
					tags: Codec.Array(Codec.Enum(["action", "horror", "fantasy"], Codec.UInt(8)), Codec.UInt(8)),
				}),
				Codec.Null,
			],
			Codec.UInt(8)
		)
	),
	isLocked: Codec.Boolean,
	status: Codec.Enum(["pending", "created", "error"], Codec.UInt(8)),
	createdAt: Codec.VarInt(),
	updatedAt: Codec.VarInt(),
	deletedAt: Codec.Optional(Codec.VarInt()),
});

type CommonValue = Codec.Type<typeof CommonCodec>;

export const commonValue: CommonValue = {
	id: randomBytes(32).toString("hex"),
	ids: [
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
		randomBytes(32).toString("hex"),
	],
	records: {
		record1: {
			id: randomBytes(32).toString("hex"),
			title: "Dicta perspiciatis molestias nam eos ipsam amet omnis.",
			description:
				"Eius reiciendis quia eius numquam reprehenderit velit et asperiores. Error dolorum reiciendis qui natus consequatur id deserunt totam. Quasi id eos est itaque.\nMagnam sed facilis nulla animi cupiditate autem quis aliquid. Id molestiae dolores voluptatem eveniet. Consequatur adipisci adipisci quisquam qui ut.\nQuaerat quas incidunt error et itaque molestias nobis. Eveniet quasi ea sed laboriosam quo voluptatem. Fuga sit soluta labore nihil.",
			children: [randomBytes(32).toString("hex"), randomBytes(32).toString("hex"), randomBytes(32).toString("hex")],
			tags: ["action"],
		},
		record2: null,
	},
	isLocked: false,
	status: "pending",
	createdAt: Date.now(),
	updatedAt: Date.now(),
	deletedAt: undefined,
};
