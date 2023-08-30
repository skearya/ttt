<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;
	let roomName: string = '';
	let publicRoom: boolean = false;
</script>

<form
	on:submit|preventDefault={async () => {
		let response = await fetch('http://localhost:3000/createRoom', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: roomName,
				public: publicRoom
			})
		});
		let json = await response.json();

		if (json.type == 'success') {
			await goto(`/${json.room}`);
		}
	}}
	class="flex items-center"
>
	<h1 class="text-2xl">create room</h1>
	<input bind:value={roomName} type="text" class="border" />
	<h1>public room</h1>
	<input bind:checked={publicRoom} type="checkbox" />
</form>

<h1>public rooms:</h1>
<ul class="list-disc list-inside">
	{#each Object.entries(data.rooms) as [room, players]}
		<li>
			<a href={room}>{room}: {players}/2 players</a>
		</li>
	{/each}
</ul>
