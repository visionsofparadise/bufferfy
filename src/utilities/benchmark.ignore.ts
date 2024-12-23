import Benchmark, { Suite } from "benchmark";
import { randomBytes } from "crypto";
import { pack, unpack } from "msgpackr";
import { setImmediate } from "timers/promises";
import type { AbstractCodec } from "../Codecs/Abstract";
const console = require("console");

global.console = console;

const warmUp = () => {
	let index = 1000;

	while (index--) {
		randomBytes(1024);
	}
};

const logMemory = (name: string) => {
	const memoryUsage = process.memoryUsage();

	console.log(name + "	" + `${memoryUsage.rss} RSS	${memoryUsage.heapTotal} Total	${memoryUsage.heapUsed} Used	${memoryUsage.arrayBuffers} Buffers`);
};

const onCycle = (event: Benchmark.Event) => {
	console.log(String(event.target).split(" x ").join("	"));

	logMemory(String(event.target).split(" x ")[0]);
};

export const encodeBenchmark = async (name: string, value: any, codec: AbstractCodec, options?: Benchmark.Options) => {
	const bufferfyEncodeId = `bufferfy.encode.${name}`;

	warmUp();
	logMemory("BEFORE");
	console.log("");

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
				new TextEncoder().encode(JSON.stringify(value));
			},
			options
		)
		.on("cycle", onCycle)
		.run();

	console.log("");
	await setImmediate();
};

export const decodeBenchmark = async (name: string, value: any, codec: AbstractCodec, options?: Benchmark.Options) => {
	const bufferfyBuffer = codec.encode(value);
	const msgPackBuffer = pack(value);
	const jsonBuffer = new TextEncoder().encode(JSON.stringify(value));

	const bufferfyDecodeId = `bufferfy.decode.${name}`;

	warmUp();
	logMemory("BEFORE");
	console.log("");

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
				JSON.parse(new TextDecoder().decode(jsonBuffer));
			},
			options
		)
		.on("cycle", onCycle)
		.run();

	await setImmediate();

	console.log("");
};

export const sizeBenchmark = async (value: any, codec: AbstractCodec) => {
	const bufferfyBuffer = codec.encode(value);
	const msgPackBuffer = pack(value);
	const jsonBuffer = new TextEncoder().encode(JSON.stringify(value));

	console.log("bufferfy.size" + `	${bufferfyBuffer.byteLength}`);
	console.log("msgpack.size" + `	${msgPackBuffer.byteLength}`);
	console.log("JSON.size" + `	${jsonBuffer.byteLength}`);

	console.log("");
};
