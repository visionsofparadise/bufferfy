import { randomBytes } from "crypto";
import { Codec } from "../index";

export const SpreadCodec = Codec.Object({
	any: Codec.Any(),
	array: Codec.Array(Codec.BitField(["test"]), {
		lengthCodec: Codec.UInt(8),
	}),
	boolean: Codec.Boolean(),
	buffer: Codec.Buffer({ length: 1 }),
	constant: Codec.Constant("test"),
	enumerated: Codec.Enum(["test1", "test2"], { indexCodec: Codec.UInt(8) }),
	null: Codec.Null({ id: "null" }),
	record: Codec.Record(Codec.String({ length: 4 }), Codec.String({ length: 4 }), { lengthCodec: Codec.UInt(8) }),
	transform: Codec.Transform(Codec.String({ length: 2 }), { encode: (value: number) => value.toString(10), decode: (value) => parseInt(value) }),
	tuple: Codec.Tuple([Codec.UInt(8), Codec.Pointer<null>("null")]),
	undefined: Codec.Undefined(),
});

type SpreadValue = Codec.Type<typeof SpreadCodec>;

export const spreadValue: SpreadValue = {
	any: {
		test1: true,
		test2: false,
	},
	array: [
		{
			test: true,
		},
	],
	boolean: true,
	buffer: Buffer.from([1]),
	constant: "test",
	enumerated: "test2",
	null: null,
	record: {
		test: "test",
	},
	transform: 27,
	tuple: [1, null],
	undefined: undefined,
};

export const CommonCodec = Codec.Object({
	id: Codec.String({ encoding: "hex", length: 64 }),
	ids: Codec.Array(Codec.String({ encoding: "hex", length: 64 }), {
		lengthCodec: Codec.UInt(8),
	}),
	records: Codec.Record(
		Codec.String({ lengthCodec: Codec.UInt(8) }),
		Codec.Union(
			[
				Codec.Object({
					id: Codec.String({ encoding: "hex", length: 64 }),
					title: Codec.String({ lengthCodec: Codec.UInt(16) }),
					description: Codec.Optional(Codec.String({ lengthCodec: Codec.UInt(32) })),
					children: Codec.Array(Codec.String({ encoding: "hex", length: 64 }), {
						lengthCodec: Codec.UInt(8),
					}),
					tags: Codec.Array(Codec.Enum(["action", "horror", "fantasy"], { indexCodec: Codec.UInt(8) }), {
						lengthCodec: Codec.UInt(8),
					}),
				}),
				Codec.Null(),
			],
			{ indexCodec: Codec.UInt(8) }
		),
		{
			lengthCodec: Codec.UInt(32),
		}
	),
	isLocked: Codec.Boolean(),
	status: Codec.Enum(["pending", "created", "error"], { indexCodec: Codec.UInt(8) }),
	createdAt: Codec.UInt(48),
	updatedAt: Codec.UInt(48),
	deletedAt: Codec.Optional(Codec.UInt(48)),
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
};
