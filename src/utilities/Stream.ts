export class Stream {
	public view: DataView;

	constructor(public buffer: Buffer, public position: number = 0) {
		this.view = new DataView(buffer.buffer);
	}
}
