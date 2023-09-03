<script lang="ts">
	import { goto } from '$app/navigation';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Pencil, Plus } from 'lucide-svelte';

	export let data;
	let roomName: string = '';
	let publicRoom: boolean = false;
	let usernameInput: string = localStorage.getItem('username') || '';
	let usernameDialog: boolean = false;

	type CreateRoomResponse<T = 'error' | 'success'> = T extends 'success'
		? {
				type: T;
				room: string;
				public: boolean;
		  }
		: {
				type: T;
				message: string;
		  };

	async function createRoom() {
		if (roomName == '') {
			return;
		}

		let response: CreateRoomResponse = await (
			await fetch('http://localhost:3000/createRoom', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: roomName,
					public: publicRoom
				})
			})
		).json();

		if (response.type == 'success') {
			await goto(`/${response.room}`);
		} else {
			alert(response.message);
		}
	}

	function setUsername() {
		localStorage.setItem('username', usernameInput);
		usernameDialog = false;
	}
</script>

<section class="flex h-screen items-center justify-center">
	<div class="flex h-96 rounded-xl border p-6">
		<div class="w-64 space-y-2">
			<h1 class="text-3xl font-bold">ttc</h1>
			<Dialog.Root>
				<Dialog.Trigger class="w-full">
					<div class="bg-accent flex items-center justify-between rounded-md p-3">
						<h1>Create Room</h1>
						<Plus size="25" />
					</div>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Create Room</Dialog.Title>
					</Dialog.Header>
					<Input
						id="room"
						placeholder="room name"
						bind:value={roomName}
						on:keydown={(e) => {
							if (e.key == 'Enter') createRoom();
						}}
					/>
					<div class="flex items-center space-x-2">
						<Checkbox id="room" bind:checked={publicRoom} />
						<Label for="room">Public room</Label>
					</div>
					<Dialog.DialogFooter>
						<Button on:click={createRoom}>Create</Button>
					</Dialog.DialogFooter>
				</Dialog.Content>
			</Dialog.Root>
			<div class="bg-accent flex items-center justify-between rounded-md p-3">
				<Dialog.Root bind:open={usernameDialog}>
					<Dialog.Trigger>Change Username</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Change Username</Dialog.Title>
						</Dialog.Header>
						<Input
							id="room"
							placeholder="username"
							bind:value={usernameInput}
							on:keydown={(e) => {
								if (e.key == 'Enter') setUsername();
							}}
						/>
						<Dialog.DialogFooter>
							<Button on:click={setUsername}>Change</Button>
						</Dialog.DialogFooter>
					</Dialog.Content>
				</Dialog.Root>
				<Pencil size="25" />
			</div>
		</div>

		<Separator orientation="vertical" class="mx-5"></Separator>

		<div class="h-full w-56 space-y-2 overflow-auto">
			<h1 class="text-lg font-semibold">Public Rooms</h1>
			{#each Object.entries(data.rooms) as [room, players]}
				<a href={room} class="flex justify-between rounded-md border p-2 text-sm">
					<h1>{room.substring(1)}</h1>
					<h1 class="text-muted-foreground">{players}/2</h1>
				</a>
			{:else}
				<h1>none :(</h1>
			{/each}
		</div>
	</div>
</section>
