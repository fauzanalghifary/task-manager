import { TasksSection } from "./tasks/TasksSection";

function App() {
  return (
    <main className="mx-auto w-[min(calc(100%-2rem),40rem)] py-20">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-(--ink)">
          Tasks
        </h1>
        <p className="mt-2 text-(--ink-soft)">
          Capture work and track it through to done.
        </p>
      </header>

      <TasksSection />
    </main>
  );
}

export default App;
