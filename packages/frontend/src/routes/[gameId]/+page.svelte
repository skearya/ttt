<script lang="ts">
	import type { ServerToClientEvents, ClientToServerEvents, GameData } from '@ttt/types/index';
	import { SERVER_URL } from '$env/static/public';
	import { onDestroy } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Toggle } from '$lib/components/ui/toggle';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Loader, Menu } from 'lucide-svelte';
	import { flyAndScale } from '$lib/utils.js';

	export let data;
	let players: Array<string> = [];
	let gameData: GameData;
	let username = localStorage.getItem('username');
	let usernameInput: string = '';
	let usernameDialog: boolean = false;
	let menu: boolean = window.innerWidth > 768;

	function setUsername() {
		if (usernameInput == '') {
			return;
		}

		username = usernameInput;
		localStorage.setItem('username', username);
		socket.auth = { username };
		usernameDialog = false;
		socket.connect();
	}

	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
		`${SERVER_URL}/${data.gameId}`,
		{
			auth: {
				username
			},
			autoConnect: false
		}
	);

	if (username == null) {
		usernameDialog = true;
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

<section class="flex h-screen">
	{#if gameData}
		<Toggle
			aria-label="toggle menu"
			class="absolute right-2 top-2"
			bind:pressed={menu}
			on:click={() => (menu = !menu)}
		>
			<Menu class="h-4 w-4" />
		</Toggle>
		{#if menu}
			<div
				transition:flyAndScale={{ x: -100, y: 0, start: 1 }}
				class="bg-background absolute flex h-full w-[20rem] flex-col border p-6 md:static"
			>
				<button
					title="Copy link"
					class="w-full overflow-hidden text-ellipsis whitespace-nowrap text-left text-xl font-bold"
					on:click={async () => {
						await navigator.clipboard.writeText(window.location.href);
					}}
				>
					{window.location.href}
				</button>

				<Separator class="my-3"></Separator>

				{#if gameData.rematches > 0}
					<h1 class="font-semibold">Rematches: {gameData.rematches}</h1>
				{/if}
				<h1 class="font-semibold">Players</h1>
				{#each players as player}
					<h1>{player}</h1>
				{/each}

				<a href="/" class="mt-auto">home</a>
			</div>
		{/if}

		<div class="flex w-full items-center justify-center">
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
			</div>
		</div>
	{:else if !gameData && !usernameDialog}
		<div class="flex h-full w-full items-center justify-center">
			<Loader></Loader>
		</div>
	{/if}
</section>

<Dialog.Root bind:open={usernameDialog}>
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
