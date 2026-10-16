import { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './api';

export default function TaskList({ token, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTasks(token);
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const task = await createTask(token, title);
      setTasks([...tasks, task]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(task) {
    try {
      const updated = await updateTask(token, task.id, { done: !task.done });
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(token, id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p style={{ padding: 32 }}>Loading…</p>;

  return (
    <div style={{ padding: 32, fontFamily: 'system-ui', maxWidth: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Tasks</h1>
        <button onClick={onLogout}>Log out</button>
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Add</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {tasks.length === 0 ? (
        <p style={{ color: '#666' }}>No tasks yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => handleToggle(task)}
              />
              <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none' }}>
                {task.title}
              </span>
              <button onClick={() => handleDelete(task.id)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}