<script>
  import "./styles/tailwind.css";
  import "./styles/font.css";
  import "./styles/globals.css";
	import Logo from './components/Logo.svelte';
	import Background from './components/Background.svelte';
	import Wave from './components/Wave.svelte';
	import Content from './components/Content.svelte';
	import { onMount } from 'svelte';

	let tilt = false;
  let content;
  let nav;

	onMount(() => {
    content = document.getElementById('content');
    nav = document.getElementById('nav');
  });

	const toggleTilt = () => {
		tilt = !tilt
	}
	
	const scrollToBottom = () => {
		tilt = false;

		window.scrollTo({
			left: 0,
			top: document.body.scrollHeight,
			behavior: 'smooth'
		});
	}
</script>


<Logo bind:tilt></Logo>

<nav
	id="nav"
	class="flex sticky top-6 md:top-12 justify-end mx-6 md:mx-12 z-10"
>

	<button
		class="underline md:text-2xl mr-3"
		on:click="{toggleTilt}"
	>
		Projekte
	</button>
	<button
		class="underline md:text-2xl"
		on:click="{scrollToBottom}"
	>
		About
	</button>
</nav>


<main class="min-h-full flex flex-col flex-grow overflow-hidden relative">
	<Background></Background>

	<div class="mb-28 p-4 max-w-5xl w-full mx-auto">
		<p class="text-sm md:text-base">
			Supermittel ist ein Kleinunternehmen in Konstanz welches ehrenamtlich lokale Projekte unterstützt. Gerne machen wir Website und Gestaltung, falls
			du interessiert bist melde dich doch einfach bei uns unter: <a href="mailto:contact@supermittel.com" class="underline">contact@supermittel.com</a>.
		</p>
	</div>

	<div
		id="content"
		class="content absolute top-0 h-full w-full flex flex-col flex-grow"
		class:visible="{tilt}"
	>
		<Wave></Wave>

		<div class="-my-px pt-16 bg-primary"></div>

		<Content></Content>

		<footer class="bg-primary p-2">
			<a href="/impressum">
				Impressum
			</a>
		</footer>
	</div>
	
</main>

<style>

	.content {
		top: 92%;
		transition: var(--transition-water-rising) linear;
		transition-delay: var(--transition-water-rising-delay);
	}

	.content.visible {
		top: 0;
	}
</style>