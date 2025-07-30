"use client";

import { functionGetAllUsers, functionCreateTask, functionDeleteTask, functionUpdateTask } from "@/api/api";
import { useEffect, useState } from "react";
import "./todo-styles.css";

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [newTaskText, setNewTaskText] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)

  useEffect(() => {
    functionGetAllUsers()
      .then((data) => {
        console.log("Ответ от API:", data);
        setTasks(data);
      })
      .catch((e: any) => setError(e.message));
  }, []);

  // Определяем тему по умолчанию при загрузке
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkTheme(prefersDark)
    
    // Слушаем изменения системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkTheme(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, []);

  // Автоматическое обновление каждые 30 секунд (опционально)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedTasks = await functionGetAllUsers()
        setTasks(updatedTasks)
        console.log("Автоматическое обновление списка задач")
      } catch (e) {
        console.error("Ошибка при автоматическом обновлении:", e)
      }
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, []);

  // Блок кода, в котором я добаляю функционал с добавлением новой задачи

  // Обработчик изменения поля ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(e.target.value);
  };
  // Обработчик отправки новой задачи
  const handleAddTask = async (e: React.FormEvent<HTMLButtonElement>) => {
    // Проверяю, не пустое ли поле
    if (!newTaskText.trim()) {
      setError("Field is EMPTY!")
      return
    }
    setError("")
    setIsAdding(true)

    try{
      await functionCreateTask({
        Task: newTaskText
      })
      console.log("Новая задача создана");

      // Принудительно обновляем список задач
      const updatedTasks = await functionGetAllUsers()
      setTasks(updatedTasks)
      setNewTaskText("");
    } catch (e){
      console.error("Ошибка при создании задачи:", e)
      setError(e instanceof Error ? e.message : "Что то проебалось")
    } finally {
      setIsAdding(false)
    }
  }

  const handleTaskDeleter = async (id: number) => {
    try{
      setIsDeleting(true)
      await functionDeleteTask(id)
      
      // Принудительно обновляем список задач
      const updatedTasks = await functionGetAllUsers()
      setTasks(updatedTasks)
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("Unknown error occurred")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // Функция для принудительного обновления списка задач
  const handleRefreshTasks = async () => {
    try {
      setIsRefreshing(true)
      setError("")
      const updatedTasks = await functionGetAllUsers()
      setTasks(updatedTasks)
      console.log("Список задач обновлен")
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("Ошибка при обновлении списка")
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Функция для начала редактирования задачи
  const handleStartEdit = (task: any) => {
    setEditingId(task.id)
    setEditingText(task.Task)
  }

  // Функция для сохранения изменений
  const handleSaveEdit = async () => {
    if (!editingId || !editingText.trim()) return

    try {
      setIsUpdating(true)
      setError("")
      
      await functionUpdateTask(editingId, { Task: editingText.trim() })
      
      // Обновляем локальное состояние
      setTasks(tasks.map(task => 
        task.id === editingId 
          ? { ...task, Task: editingText.trim() }
          : task
      ))
      
      // Сбрасываем состояние редактирования
      setEditingId(null)
      setEditingText("")
      
      console.log("Задача обновлена")
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("Ошибка при обновлении задачи")
      }
    } finally {
      setIsUpdating(false)
    }
  }

  // Функция для отмены редактирования
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingText("")
  }

  // Функция для переключения темы
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
    // Применяем тему к документу
    if (isDarkTheme) {
      document.documentElement.style.setProperty('color-scheme', 'light')
    } else {
      document.documentElement.style.setProperty('color-scheme', 'dark')
    }
  }

  if (error) return (
    <div className="todo-error">
      Ошибка: {error}
    </div>
  );

  return (
    <div className="todo-container">
      {/* Заголовок */}
      <header className="todo-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h1 className="todo-title">
            Project ToDo
          </h1>
          <button 
            onClick={toggleTheme}
            style={{
              padding: '10px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--text-color)',
              cursor: 'pointer',
              fontSize: '20px',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            title={isDarkTheme ? "Переключить на светлую тему" : "Переключить на темную тему"}
          >
            {isDarkTheme ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <div className="todo-content">
        
        {/* Поле ввода */}
        <div className="todo-input-section">
          <input 
            type="text"
            placeholder="Введите текст"
            value={newTaskText}
            onChange={handleInputChange}
            disabled={isAdding}
            className="todo-input"
          />
          <div className="todo-button-group">
            <button 
              onClick={handleAddTask}
              disabled={isAdding || !newTaskText.trim()}
              className="todo-button"
            >
              {isAdding ? "Добавление..." : "Внести в список"}
            </button>
            
            <button 
              onClick={handleRefreshTasks}
              disabled={isRefreshing}
              className="todo-button"
            >
              {isRefreshing ? "🔄 Обновление..." : "🔄 Обновить"}
            </button>
          </div>
        </div>

        {/* Список задач */}
        <div className="todo-section">
          <h2 className="todo-section-title">
            Список задач
          </h2>
          
          {tasks.length === 0 ? (
            <div className="todo-empty-state">
              <p className="todo-empty-text">
                Список задач пуст. Добавьте первую задачу!
              </p>
            </div>
          ) : (
            <div className="todo-list">
              {tasks.map((task: any) => (
                <div key={task.id} className={`todo-item ${editingId === task.id ? 'editing' : ''}`}>
                  {editingId === task.id ? (
                    // Режим редактирования
                    <>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="todo-edit-input"
                        placeholder="Введите новый текст"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit()
                          }
                        }}
                      />
                      <button 
                        onClick={handleSaveEdit}
                        disabled={isUpdating || !editingText.trim()}
                        className="todo-button edit"
                      >
                        {isUpdating ? "Сохранение..." : "💾"}
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="todo-button cancel"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    // Обычный режим просмотра
                    <>
                      <span className="todo-text">
                        {task.Task}
                      </span>
                      <button 
                        onClick={() => handleStartEdit(task)}
                        disabled={isDeleting || isUpdating}
                        className="todo-button edit"
                        style={{ marginLeft: '10px' }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleTaskDeleter(task.id)}
                        disabled={isDeleting || isUpdating}
                        className="todo-button delete"
                      >
                        {isDeleting ? "Удаление..." : "🗑️"}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}