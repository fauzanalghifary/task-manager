function App() {
  return (
    <main className="mx-auto w-[min(calc(100%-2rem),72rem)] py-20">
      <header className="max-w-2xl">
        <p className="mb-3 text-xs font-bold tracking-[0.12em] text-[#a0442b] uppercase">
          Internal workspace
        </p>
        <h1 className="text-[clamp(2.5rem,7vw,4.75rem)] leading-[0.95] font-bold tracking-[-0.05em] text-[#20231d]">
          Task Manager
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-7">
          Create tasks, move work forward, and review every status change.
        </p>
      </header>
    </main>
  );
}

export default App;
