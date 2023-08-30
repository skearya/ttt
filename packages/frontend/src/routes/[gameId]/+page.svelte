<script lang="ts">
	import { io, Socket } from 'socket.io-client';
	import type { ServerToClientEvents, ClientToServerEvents, GameData } from '@ttt/types/index';

	export let data;
	let username = `user${Math.floor(Math.random() * 100)}`;
	let players: Array<string> = [];
	let gameData: GameData;

	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
		`http://localhost:3000/${data.gameId}`,
		{
			auth: {
				username
			},
			autoConnect: false
		}
	);
	socket.connect();

	socket.on('players', (newPlayers) => {
		players = newPlayers;
	});
	socket.on('data', (newData) => {
		gameData = newData;
	});
	socket.on('connect_error', (err) => {
		alert(err.message);
	});
</script>

{#if gameData}
	<h1 class="font-bold text-xl">{username}</h1>

	<div class="flex text-sm space-x-2">
		<h1>players:</h1>
		{#each players as player}
			<h3>{player}</h3>
		{/each}
	</div>
	{#if gameData.currentTurn}
		<h1>current turn: {gameData.currentTurn}</h1>
	{/if}
	<div class="grid grid-cols-3 grid-rows-3 text-black max-w-sm">
		{#each gameData?.board || [] as row, r}
			{#each row as col, c}
				{#if col !== ''}
					<button>{col}</button>
				{:else}
					<button
						on:click={() => {
							socket.emit('boardUpdate', {
								row: r,
								col: c
							});
						}}>empty</button
					>
				{/if}
			{/each}
		{/each}
	</div>
	{#if gameData.status.over}
		<h1>winner: {gameData.status.winner}</h1>
		<button on:click={() => socket.emit('rematch')} class="bg-gray-300">
			rematch? (votes: {gameData.status.rematchVotes}/2)
		</button>
	{/if}
	{#if gameData.rematches > 0}
		<h1>rematches: {gameData.rematches}</h1>
	{/if}
{/if}
