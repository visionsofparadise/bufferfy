import { Context } from "../../utilities/Context";
import { PointableOptions } from "../../utilities/Pointable";
import { Simplify } from "../../utilities/Simplify";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec, CodecType } from "../Abstract";
import { OptionalCodec } from "../Optional";

type RequiredKeys<T extends Record<string | number, AbstractCodec<any>>> = {
	[K in keyof T]: T[K] extends OptionalCodec<any> ? undefined : K;
}[keyof T];

type OptionalKeys<T extends Record<string | number, AbstractCodec<any>>> = {
	[K in keyof T]: T[K] extends OptionalCodec<any> ? K : undefined;
}[keyof T];

type _OutputObject<T extends Record<string | number, AbstractCodec<any>>> = {
	[K in Exclude<RequiredKeys<T>, undefined>]: CodecType<T[K]>;
} & {
	[K in Exclude<OptionalKeys<T>, undefined>]?: CodecType<T[K]>;
};

type OutputObject<T extends Record<string | number, AbstractCodec<any>>> = {
	[K in keyof _OutputObject<T>]: _OutputObject<T>[K];
};

export interface ObjectCodecOptions extends PointableOptions {}

export class ObjectCodec<Properties extends Record<string | number, AbstractCodec<any>>> extends AbstractCodec<Simplify<OutputObject<Properties>>> {
	private _reverseEntries: Array<[keyof OutputObject<Properties>, AbstractCodec]>;

	constructor(public readonly properties: Properties, options?: ObjectCodecOptions) {
		super();

		this._id = options?.id;
		this._reverseEntries = Object.entries(properties) as Array<[keyof OutputObject<Properties>, AbstractCodec]>;
		this._reverseEntries.reverse();
	}

	match(value: any, context: Context): value is OutputObject<Properties> {
		if (!value || typeof value !== "object") return false;

		let index = this._reverseEntries.length;

		while (index--) {
			const [propertyKey, propertyCodec] = this._reverseEntries[index];

			if (!propertyCodec.match(value[propertyKey], context)) return false;
		}

		this.setContext(value, context);

		return true;
	}

	encodingLength(value: OutputObject<Properties>, context: Context = new Context()): number {
		this.setContext(value, context);

		let size = 0;
		let index = this._reverseEntries.length;

		while (index--) {
			const [propertyKey, propertyCodec] = this._reverseEntries[index];

			size += propertyCodec.encodingLength(value[propertyKey], context);
		}

		return size;
	}

	write(value: OutputObject<Properties>, stream: Stream, context: Context): void {
		this.setContext(value, context);

		let index = this._reverseEntries.length;

		while (index--) {
			const [propertyKey, propertyCodec] = this._reverseEntries[index];

			propertyCodec.write(value[propertyKey], stream, context);
		}
	}

	read(stream: Stream, context: Context): OutputObject<Properties> {
		const value: Partial<OutputObject<Properties>> = {};

		let index = this._reverseEntries.length;

		while (index--) {
			const [propertyKey, propertyCodec] = this._reverseEntries[index];

			if (propertyCodec instanceof OptionalCodec) {
				const propertyValue = propertyCodec.read(stream, context);

				if (propertyValue === undefined) continue;

				value[propertyKey] = propertyValue as any;

				continue;
			}

			value[propertyKey] = propertyCodec.read(stream, context);
		}

		this.setContext(value as OutputObject<Properties>, context);

		return value as OutputObject<Properties>;
	}
}

export function createObjectCodec<Properties extends Record<string | number, AbstractCodec<any>>>(...parameters: ConstructorParameters<typeof ObjectCodec<Properties>>): ObjectCodec<Properties> {
	return new ObjectCodec<Properties>(...parameters);
}
