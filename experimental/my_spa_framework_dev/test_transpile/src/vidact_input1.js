function App() {
  const [counter, setCounter] = useState(0);
  const handleIncrement = () => setCounter(counter + 1);
  const handleDecrement = () => setCounter(counter - 1);

  return (
    <div>
      <p>Current count is {counter}</p>
      <button onClick={handleIncrement}>+ Increment</button>
      <button onClick={handleDecrement}>- Decrement</button>
    </div>
  );
}

document.body.innerHTML = "";
document.body.append(App({}).element.element);
