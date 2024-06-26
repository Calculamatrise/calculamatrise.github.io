let canvas = new OffscreenCanvas(0, 0);
let ctx = canvas.getContext('2d');
addEventListener('message', function ({ data }) {
	if ('canvas' in data) {
		canvas = data.canvas;
		ctx = canvas.getContext('2d');
		return;
	}

	switch (data.cmd) {
	case 'move':
		data.physics = types.physics.split(/,+/g).map(t => t.split(/\s+/g).map((t, e) => (parseInt(t, 32) + data[e % 2 == 0 ? 'x' : 'y']).toString(32)).join(' ')).join(' ');
		data.scenery = types.scenery.split(/,+/g).map(t => t.split(/\s+/g).map((t, e) => (parseInt(t, 32) + data[e % 2 == 0 ? 'x' : 'y']).toString(32)).join(' ')).join(' ');
		data.powerups = types.powerups.split(/,+/g).map(t => t.split(/\s+/g).map((t, e, i) => (i[0] == 'V' ? e > 0 && e < 3 : e > 0) ? (parseInt(t, 32) + data[e % 2 == 0 ? 'x' : 'y']).toString(32) : t).join(' ')).join(',');
		data.result = `${data.physics}#${data.scenery}#${data.powerups}`;
		break;
	case 'render':
		let types = {
			physics: [],
			scenery: [],
			powerups: []
		}

		data.filter && filter(data.pixels);
		data.invert && invert(data.pixels);
		for (let y = 0, iy; y < data.pixels.height; y++) {
			for (let x = 0, ix, dx, e; x < data.pixels.width; x++) {
				e = (x + y * data.pixels.width) * 4;
				if (data.pixels.data[e + 3] === 0) continue;
				if (data.pixels.data[e] == 255 || data.pixels.data[e - 4] == data.pixels.data[e] && Math.floor((e - 4) / data.pixels.width / 4) == y) continue;
				ix = x * 2;
				iy = y * 2;
				dx = ix + 2;
				for (let i = x + 1, s; i < data.pixels.width; i++) {
					s = (i + y * data.pixels.width) * 4;
					if (data.pixels.data[s + 3] !== 0 && i >= data.pixels.width - 1 || data.pixels.data[s] != data.pixels.data[e]) {
						dx = (i - 1) * 2;
						break;
					}
				}

				types[data.pixels.data[e] == 0 ? 'physics' : 'scenery'].push(`${ix.toString(32)} ${iy.toString(32)} ${dx.toString(32)} ${iy.toString(32)},${ix.toString(32)} ${(iy + 2).toString(32)} ${dx.toString(32)} ${(iy + 2).toString(32)}`);
			}

			postMessage({
				cmd: 'progress',
				progress: Math.round(y / (data.pixels.height / 100))
			});
		}

		data.result = types.physics.join(',') + '#' + types.scenery.join(',') + '#' + types.powerups.join(',');
		data.size = data.result.length;
	}

	postMessage(data);
});

function filter(pixels) {
	for (let t = 0, e = 0; t in pixels.data; t += 4)
		e = pixels.data[t + 3] === 0 ? 255 : pixels.data[t] * .2 + pixels.data[t + 1] * .7 + pixels.data[t + 2] * .1,
		pixels.data[t] = pixels.data[t + 1] = pixels.data[t + 2] = e <= 85 ? 0 : e <= 170 ? 170 : 255;
	return pixels;
}

function invert(pixels) {
	for (let t = 0; t in pixels.data; t += 4)
		pixels.data[t] = 255 - pixels.data[t],
		pixels.data[t + 1] = 255 - pixels.data[t + 1],
		pixels.data[t + 2] = 255 - pixels.data[t + 2];
	return pixels;
}

function invertAlpha(pixels) {
	for (let t = 0; t in pixels.data; t += 4)
		pixels.data[t + 3] = 255 - pixels.data[t + 3];
	return pixels;
}