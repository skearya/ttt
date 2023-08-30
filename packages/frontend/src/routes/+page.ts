import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	let rooms: RoomsData = await (await fetch('http://localhost:3000/rooms')).json();
	return { rooms };
}) satisfies PageLoad;

interface RoomsData {
	[roomName: string]: number;
}
