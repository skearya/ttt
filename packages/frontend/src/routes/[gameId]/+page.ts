import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	return {
		gameId: params.gameId
	};
}) satisfies PageLoad;
