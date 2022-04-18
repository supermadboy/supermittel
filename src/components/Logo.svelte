<script>
  export let tilt = false;
	import { afterUpdate, onMount } from 'svelte';

  let bottle;
  let water;

	onMount(() => {
    bottle = document.getElementById('bottle');
    water = document.getElementById('water');
  });

  
	afterUpdate(() => {
		if (tilt) {
      water.classList.add("delayed");
      bottle.classList.remove("delayed");
    } else {
      bottle.classList.add("delayed");
      water.classList.remove("delayed");
    }
	});
</script>

<svg viewBox="-2 -5 70 620" class="absolute -z-10 max-h-full w-56 left-3" preserveAspectRatio="xMinYMin meet">
  <path
    id="water"
    class="water delayed"
    class:flows={tilt}
    d="M 50 25 C 60 25 66 44 66 620"
  >
  </path>

  <g
    id="bottle"
    class="bottle"
    class:falls-over={tilt}
  >

    <path
      class="liquid"
      d="M 16 33 h -16 v -24 c 0 -2 2 -3 5 -5 v -4 h 6 v 4 c 3 2 5 3 5 5 Z"
    >
    </path>

    <path
      class="cap"
      d="M 5 1 V 0 H 11 V 1 Z"
    >
    </path>

    <g
      class="label"
    >
      <path
        d="M 0 13 H 16 V 23 H 0 Z"
      >
      </path>      
      <circle cx="8" cy="18" r="3"/>
      <path
        d="M 4 21 l 8 -6"
      >
      </path>
    </g>
  </g>
</svg>

<style>

  .water {
    transition: all var(--transition-bottle-falling);

    fill: none;
    stroke-linecap: round;
    stroke-width: 3;
    stroke-dasharray: 620, 620;
    stroke-dashoffset: 620;

    @apply stroke-primary;
  }

  .water.flows {
    stroke-dashoffset: 0;
  }

  .bottle {
    transition: var(--transition-bottle-falling) cubic-bezier(1, 0, 1, 1);
    transform-origin: bottom right;
    transform-box: fill-box;
    transform: rotate(0);

    @apply stroke-black;
  }

  .bottle.falls-over {
    transform: rotate(90deg);
  }

  .liquid {
    @apply fill-primary;
  }

  .cap {
    @apply fill-black;
  }
  
  .label {
    @apply fill-white;
    @apply stroke-black;
  }

  .delayed {
    transition-delay: var(--transition-bottle-delay);
  }
</style>