<script lang="ts">
	import type { ServerToClientEvents, ClientToServerEvents, GameData } from '@ttt/types/index';
	import { onDestroy } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Loader } from 'lucide-svelte';

	export let data;
	let players: Array<string> = [];
	let gameData: GameData;
	let username = localStorage.getItem('username');
	let open: boolean = false;
	let usernameInput: string = '';

	function setUsername() {
		if (usernameInput == '') {
			return;
		}

		username = usernameInput;
		localStorage.setItem('username', username);
		socket.auth = { username };
		open = false;
		socket.connect();
	}

	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
		`http://localhost:3000/${data.gameId}`,
		{
			auth: {
				username
			},
			autoConnect: false
		}
	);

	if (username == null) {
		open = true;
	} else {
		socket.connect();
	}

	socket.on('players', (newPlayers) => {
		players = newPlayers;
	});
	socket.on('data', (newData) => {
		gameData = newData;
	});
	socket.on('connect_error', (err) => {
		alert(err.message);
	});

	onDestroy(() => {
		socket.disconnect();
	});
</script>

<section class="flex h-screen items-center justify-center">
	<Dialog.Root bind:open>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Choose a username</Dialog.Title>
			</Dialog.Header>
			<Input
				bind:value={usernameInput}
				placeholder="username"
				on:keydown={(e) => {
					if (e.key == 'Enter') setUsername();
				}}
			/>
			<Dialog.DialogFooter>
				<Button on:click={setUsername}>Join</Button>
			</Dialog.DialogFooter>
		</Dialog.Content>
	</Dialog.Root>

	{#if gameData}
		<div class="rounded-xl border p-6">
			{#if gameData.currentTurn}
				<div class="flex items-center justify-between text-2xl">
					<h1>Current Turn</h1>
					<h1>{gameData.currentTurn}</h1>
				</div>
			{/if}

			<Separator class="my-5"></Separator>

			<div class="bg-accent grid h-72 w-72 max-w-sm grid-cols-3 grid-rows-3 gap-[2px]">
				{#each gameData?.board || [] as row, r}
					{#each row as col, c}
						{#if col !== ''}
							<button class="bg-background text-3xl">
								{col}
							</button>
						{:else}
							<button
								class="bg-background"
								on:click={() => {
									socket.emit('boardUpdate', {
										row: r,
										col: c
									});
								}}
							></button>
						{/if}
					{/each}
				{/each}
			</div>

			<Separator class="my-5"></Separator>

			<h1 class="text-xl font-bold">{username}</h1>
			<div class="flex space-x-2 text-sm">
				<h1>Players:</h1>
				{#each players as player}
					<h3>{player}</h3>
				{/each}
			</div>

			{#if gameData.status.over}
				<Separator class="my-4"></Separator>
				<div class="mb-4 flex justify-between text-2xl">
					<h1>Winner</h1>
					<h1>{gameData.status.winner}</h1>
				</div>
				<Button on:click={() => socket.emit('rematch')} class="w-full bg-gray-300">
					rematch? (votes: {gameData.status.rematchVotes}/2)
				</Button>
			{/if}
			{#if gameData.rematches > 0}
				<h1 class="text-sm">Rematches: {gameData.rematches}</h1>
			{/if}
		</div>
	{:else if !gameData && !open}
		<Loader></Loader>
	{/if}
</section>
