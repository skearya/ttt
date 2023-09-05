<script lang="ts">
	import { SERVER_URL } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Github, Pencil, Plus } from 'lucide-svelte';

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
			toast.warning('Input is empty');
			return;
		}

		let response: CreateRoomResponse = await (
			await fetch(`${SERVER_URL}/createRoom`, {
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
			toast.success('Room Created', {
				action: {
					label: 'Copy Link',
					onClick: async () => {
						await navigator.clipboard.writeText(window.location.href);
					}
				}
			});
		} else {
			toast.warning(response.message);
		}
	}

	function setUsername() {
		localStorage.setItem('username', usernameInput);
		usernameDialog = false;
	}
</script>

<section class="flex h-screen items-center justify-center">
	<div class="flex h-96 flex-col rounded-xl border p-6 sm:flex-row">
		<div class="flex w-64 flex-col gap-y-2">
			<h1 class="text-3xl font-bold">ttc</h1>
			<Dialog.Root>
				<Dialog.Trigger class="bg-accent flex w-full items-center justify-between rounded-md p-3">
					<h1>Create Room</h1>
					<Plus size="25" />
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
			<Dialog.Root bind:open={usernameDialog}>
				<Dialog.Trigger class="bg-accent flex w-full items-center justify-between rounded-md p-3">
					<h1>Change Username</h1>
					<Pencil size="25" />
				</Dialog.Trigger>
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
			<a href="https://github.com/skearya/ttt" target="_blank" class="mt-auto w-min pt-3">
				<Github size="25" />
			</a>
		</div>

		<Separator class="my-5 h-[1px] w-full sm:mx-5 sm:my-0 sm:h-full sm:w-[1px]"></Separator>

		<div class="h-full space-y-2 overflow-auto sm:w-56">
			<h1 class="text-lg font-semibold">Public Rooms</h1>
			{#each Object.entries(data.rooms) as [room, players]}
				<a href={room} class="flex w-full justify-between rounded-md border p-2 text-sm">
					<h1 class="overflow-hidden text-ellipsis">{room.substring(1)}</h1>
					<h1>{players}/2</h1>
				</a>
			{:else}
				<h1>none :(</h1>
			{/each}
		</div>
	</div>
</section>
