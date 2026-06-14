import { TasksSection } from "./tasks/TasksSection";

function App() {
  return (
    <main className="mx-auto w-[min(calc(100%-2rem),40rem)] py-20">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-(--ink)">
          Tasks Manager
        </h1>
      </header>

      <TasksSection />
    </main>
  );
}

export default App;
