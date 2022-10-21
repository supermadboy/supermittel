<script >
  /** @type {string} */
  export let title;
  
  /** @type {any} */
  export let image ;
  
  /** @type {string} */
  export let text;
  
  /** @type {string} */
  export let href;
</script>

<div class="w-auto sm:w-120">
  <a class="hover:font-bold" {href} target="_blank">
    <div class="flex mb-2" >
    <p class="underline mr-1">{title}</p>
    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
      <path stroke-width="2" fill="currentColor" d="M 14 4 V 5 H 18.3 L 8.3 15 L 9 15.7 L 19 5.7 V 10 H 20 V 4 M 19 19 H 5 V 5 H 12 V 4 H 5 C 4 4 4 4 4 5 V 19 A 1 1 0 0 0 5 20 H 19 A 1 1 0 0 0 20 19 V 12 H 19 V 19 Z" />
    </svg>
  </div>
  <div class="mb-4">
    <svelte:component this={image}/>
  </div>
</a>
  <p class="text-sm md:text-base">{text}</p>
</div>