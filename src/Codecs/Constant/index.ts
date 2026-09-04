import deepEqual from "fast-deep-equal";
import { domainOf, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

/**
 * Creates a codec for a constant.
 *
 * Serializes to ```N/A```
 *
 * No bytes are serialized.
 *
 * @param	{any} value - Value of the constant.
 * @return	{ConstantCodec} ConstantCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Constant/index.ts|Source}
 */
export const createConstantCodec = <const Value>(value: Value) => {
	if (typeof value === "object" && value !== null) return new DeepConstantCodec(value);

	return new ConstantCodec(value);
};

export class ConstantCodec<const Value> extends AbstractCodec<Value> {
	private readonly _matcher: CodecMatcher;

	constructor(public readonly value: Value) {
		super();

		this._matcher = this._buildMatcher();
	}

	protected _buildMatcher(): CodecMatcher {
		const tag = domainOf(this.value);

		return { test: (value) => value === this.value, exact: true, testTag: tag, acceptTag: tag };
	}

	override get matcher(): CodecMatcher {
		return this._matcher;
	}

	isValid(value: unknown): value is Value {
		return value === this.value;
	}

	byteLength(): number {
		return 0;
	}

	_encode(_value: Value, _writer: Writer): void {}

	_decode(_reader: Reader): Value {
		return this.value;
	}
}

export class DeepConstantCodec<Value> extends ConstantCodec<Value> {
	protected override _buildMatcher(): CodecMatcher {
		return { test: () => true, exact: false, testTag: "any", acceptTag: domainOf(this.value) };
	}

	override isValid(value: unknown): value is Value {
		return deepEqual(value, this.value);
	}
}
