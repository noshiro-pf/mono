<script lang="ts">
  import Even from './even.svelte';
  import Odd from './odd.svelte';

  let count = $state(0);
	let doubled = $derived(count * 2);

	$effect(() => {
		console.log({doubled})
	});

  const increment = () => {
    count++;
  };
</script>

<div>
  <p>カウント: {count}</p>
  <p>カウント x 2: {doubled}</p>
	<div>{count % 2 === 0 ? "偶数" : "奇数"}</div>
	<div>{#if count % 2 === 0}<Even/>{:else}<Odd />{/if}</div>
  <button onclick="{increment}">カウントアップ</button>
</div>
