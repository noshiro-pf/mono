import { createValueEmitter } from 'syncflow';

type User = Readonly<{ id: number; name: string }>;

// Create event emitter
const [userLoggedIn$, emitUserLoggedIn] = createValueEmitter<User>();

// Subscribe to events
userLoggedIn$.subscribe((user) => {
  console.log('User logged in:', user.name);
});

// Emit events
emitUserLoggedIn({ id: 1, name: 'Alice' });
