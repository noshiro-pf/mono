<script>
	let name = 'world';
	let num = 2;
	$: suffix = new Array(num).fill("!").join("");
	$: msg = `${name}${suffix}`;

	const increment = () => { num = num + 1; }
	const decrement = () => { num = Math.max(0, num - 1); }
</script>

<h1>Hello {msg}</h1>
<button on:click={increment}>+1</button>
<button on:click={decrement}>-1</button>
