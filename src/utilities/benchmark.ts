import { Suite } from "benchmark";
import { pack, unpack } from "msgpackr";
import type { AbstractCodec } from "../codecs/Abstract";
const console = require("console");

global.console = console;

const options = {
	// minSamples: 1000,
};

export const benchmark = (name: string, value: any, codec: AbstractCodec) => {
	const bufferfyEncodeId = `bufferfy.encode.${name}`;

	new Suite("encode")
		.add(
			bufferfyEncodeId,
			() => {
				codec.encode(value);
			},
			options
		)
		.add(
			"msgpack.pack".padEnd(bufferfyEncodeId.length, " "),
			() => {
				pack(value);
			},
			options
		)
		.add(
			"JSON.stringify".padEnd(bufferfyEncodeId.length, " "),
			() => {
				Buffer.from(JSON.stringify(value));
			},
			options
		)
		.on("cycle", (event: any) => {
			console.log(String(event.target).split(" x ").join("	"));
		})
		.run();

	console.log("");

	const bufferfyBuffer = codec.encode(value);
	const msgPackBuffer = pack(value);
	const jsonBuffer = Buffer.from(JSON.stringify(value));

	const bufferfyDecodeId = `bufferfy.decode.${name}`;

	new Suite("decode", { maxTime: 60, minSamples: 1000 })
		.add(
			bufferfyDecodeId,
			() => {
				codec.decode(bufferfyBuffer);
			},
			options
		)
		.add(
			"msgpack.unpack".padEnd(bufferfyDecodeId.length, " "),
			() => {
				unpack(msgPackBuffer);
			},
			options
		)
		.add(
			"JSON.parse".padEnd(bufferfyDecodeId.length, " "),
			() => {
				JSON.parse(jsonBuffer.toString());
			},
			options
		)
		.on("cycle", (event: any) => {
			console.log(String(event.target).split(" x ").join("	"));
		})
		.run();

	console.log("");

	console.log("bufferfy.size".padEnd(bufferfyDecodeId.length, " ") + `	${bufferfyBuffer.byteLength}`);
	console.log("msgpack.size".padEnd(bufferfyDecodeId.length, " ") + `	${msgPackBuffer.byteLength}`);
	console.log("JSON.size".padEnd(bufferfyDecodeId.length, " ") + `	${jsonBuffer.byteLength}`);

	console.log("");
};
