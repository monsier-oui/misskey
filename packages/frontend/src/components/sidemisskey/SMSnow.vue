<template>
<div class="snowfrakes">
	<div class="snowfrake"></div>
	<div class="snowfrake"></div>
	<div class="snowfrake"></div>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75" class="snowfrake-logo">
		<g>
			<path d="M64.79 41.57h-1.47v-3.29c0-.48-.29-.76-.81-.76h-6.05c-.52 0-.71.29-.71.76v3.29h-7.43V20.73c0-.06-.02-.12-.02-.18-.01-.89-.3-1.79-.92-2.53-.84-1-2.06-1.48-3.27-1.42v-.02c0-3.45-3.51-6.15-7.99-6.15-3.41 0-6.26 1.57-7.42 3.84-.21.4-.63.64-1.08.64s-.88-.24-1.08-.64c-1.16-2.27-4.01-3.84-7.42-3.84-4.48 0-7.99 2.7-7.99 6.15 0 2.32 1.6 4.3 4.01 5.35l-44.72 44.72a4.026 4.026 0 0 0 2.84 6.87c1.02 0 2.06-.39 2.84-1.18l43.82-43.81 1.85 8.49c.01.06.04.11.05.16.03.11.06.22.1.32.05.14.11.27.17.4a4.27 4.27 0 0 0 .44.7c.03.05.06.1.1.14.01.01.03.02.04.04.18.21.37.39.58.56.05.04.11.07.17.11.16.11.33.22.51.3.08.04.16.08.24.11.17.07.35.13.54.18l.21.06c.26.05.52.09.78.09h.01c.26 0 .52-.03.78-.09h.07c.06-.01.11-.04.17-.05.16-.04.33-.09.48-.16.09-.04.18-.08.27-.13.13-.06.26-.14.38-.21.1-.06.19-.12.28-.19.05-.04.1-.06.14-.1l12-10.04v12.35h-1.89c-5.48 0-9.94 4.46-9.94 9.94v.05c0 5.48 4.46 9.94 9.94 9.94s9.94-4.46 9.94-9.94v-1.94h7.43v11.06c0 .48.19.76.76.76h6c.52 0 .81-.29.81-.81V49.62h1.47a4.02 4.02 0 0 0 0-8.04Zm-24.51 9.99c0 1.04-.85 1.89-1.89 1.89s-1.89-.85-1.89-1.89v-.05c0-1.04.85-1.89 1.89-1.89h1.89v1.94Zm-4.15-37.78c2.74 0 4.65 1.48 4.65 2.8s-1.91 2.8-4.65 2.8-4.65-1.48-4.65-2.8 1.91-2.8 4.65-2.8Zm-8.5 4.48c.45 0 .88.24 1.08.64 1.09 2.13 3.68 3.63 6.82 3.8l-7.32 6.12-2-9.19s-.03-.09-.04-.14c.13-.2.27-.39.38-.6.21-.4.63-.64 1.08-.64Zm-13.15-1.67c0-1.33 1.91-2.8 4.65-2.8s4.65 1.48 4.65 2.8c0 .05-.02.1-.03.16-.17-.07-.35-.11-.52-.15-.06-.01-.12-.04-.18-.05-.14-.03-.3-.03-.44-.04-.11 0-.22-.03-.34-.03-.1 0-.2.02-.3.03-.17.01-.33.02-.5.06h-.04c-.09.02-.16.06-.25.08-.16.05-.32.09-.47.15-.12.05-.23.12-.34.18-.12.06-.23.12-.35.2-.14.09-.25.2-.38.31-.07.06-.14.1-.21.17l-1.62 1.62c-2.01-.38-3.34-1.57-3.34-2.67Z"/>
			<path d="M59.6 35.32c2.07 0 3.75-1.68 3.75-3.75s-1.68-3.75-3.75-3.75-3.75 1.68-3.75 3.75 1.68 3.75 3.75 3.75Z"/>
		</g>
	</svg>
</div>
</template>

<style lang="scss" scoped>
.snowfrakes {
	--snowfrake-size-base: min(2vw, 10px);
	--snowfrake-color: #dde4eb;
	position: fixed;
	inset: 0;
	z-index: 10000;
	pointer-events: none;
}

.snowfrake{
	position: absolute;
	top: -5%;
	width: var(--snowfrake-size, var(--snowfrake-size-base));
	aspect-ratio: 1 / 1;
	border-radius: 50%;
	background-color: var(--snowfrake-color, snow);
	box-shadow:
		1vw   -100px 2px var(--snowfrake-color, snow),
		12vw  -290px 1px var(--snowfrake-color, snow),
		20vw  -500px 4px var(--snowfrake-color, snow),
		46vw  -110px 8px var(--snowfrake-color, snow),
		30vw  -580px 1px var(--snowfrake-color, snow),
		39vw  -250px 2px var(--snowfrake-color, snow),
		55vw  -340px 5px var(--snowfrake-color, snow),
		51vw  -150px 2px var(--snowfrake-color, snow),
		23vw  -180px 0 var(--snowfrake-color, snow),
		78vw  -220px 4px var(--snowfrake-color, snow),
		86vw  -320px 9px var(--snowfrake-color, snow),
		94vw  -170px 7px var(--snowfrake-color, snow);
	-webkit-animation-delay: 1s;
	animation-delay: 1s;
	animation: roll var(--snowfrake-duration, 5s) linear infinite;

	&:nth-child(1){
		--snowfrake-size: calc(var(--snowfrake-size-base) * 0.6);
		--snowfrake-duration: 8s;
	}

	&:nth-child(2){
		--snowfrake-size: calc(var(--snowfrake-size-base) * 1);
		--snowfrake-duration: 5s;
	}

	&:nth-child(3){
		--snowfrake-size: calc(var(--snowfrake-size-base) * 0.3);
		--snowfrake-duration: 4s;
	}
}

.snowfrake-logo{
	position: fixed;
	top: -5%;
	width: calc(var(--snowfrake-size-base) * 5);
	aspect-ratio: 1 / 1;
	fill: var(--snowfrake-color);
	animation:  roll-logo 3.5s linear infinite;
	right: 20vh;
}

@keyframes roll {
  0% {
		left: 0;
	}
	50% {
		left: 2vw;
	}
	90% {
		opacity: 1;
	}
	100% {
		top: 100%;
		opacity: 0;
		left: -2vw;
	}
}

@keyframes roll-logo {
  0% {
		transform: rotate(0deg);
	}
  90% {
		opacity: 1;
	}
  100% {
		transform: rotate(50deg);
		top: 100%;
		opacity: 0;
	}
}
</style>
