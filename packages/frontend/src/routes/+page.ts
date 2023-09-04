import { SERVER_URL } from '$env/static/public';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	let rooms: RoomsData = await (await fetch(`${SERVER_URL}/rooms`)).json();
	return { rooms };
}) satisfies PageLoad;

interface RoomsData {
	[roomName: string]: number;
}
