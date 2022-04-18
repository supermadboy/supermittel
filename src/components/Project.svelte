<script>
  export let title;
  export let image;
  export let text;
  export let href;
</script>

<div class="w-auto sm:w-120">
  <a class="flex mb-2" {href} target="_blank">
    <p class="underline mr-1">{title}</p>
    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
      <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
    </svg>
  </a>
  <div class="mb-2">
    <svelte:component this={image}/>
  </div>
  <p class="text-sm md:text-base">{text}</p>
</div>