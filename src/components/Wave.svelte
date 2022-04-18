<svg viewBox="0 -1 30 2">
  <path
    class="wave"
    d="M -30 0 c 15 -3 15 3 30 0 c 15 -3 15 3 30 0 v 3 h -60 z"
  >
  </path>
  <path
    class="water"
    d="M -30 3 v -3 h 60  v 3 z"
  >
  </path>
</svg>

<style>
	.wave, .water {
		animation-duration: 10s;
    animation-timing-function: linear;
    animation-iteration-count:infinite;

    @apply fill-primary;
	}

	.wave {
		animation-name: waving;
    animation-timing-function: linear;

		transform: scaleY(0) translate(0);
	}

	@keyframes waving {
		0%   {transform: scaleY(0) translate(0);}
		25%   {transform: scaleY(1.2) translate(25%);}
		50%   {transform: scaleY(0) translate(50%);}
		75%   {transform: scaleY(1.2) translate(75%);}
		100%   {transform: scaleY(0) translate(100%);}
	}

	.water {
		animation-name: water;

		transform: translateY(50%);
	}

	@keyframes water {
		0%   {transform: translateY(0)}
		25%   {transform:  translateY(50%)}
		50%   {transform: translateY(0)}
		75%   {transform:  translateY(50%)}
		100%   {transform: translateY(0)}
	}
</style>