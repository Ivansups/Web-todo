import { request } from "https"


export async function functionGetAllUsers() {
    const res = await fetch("http://localhost:8000/tasks/get_all_tasks")
    if (!res.ok) throw new Error("OSHIBKA BLAT!")
    return res.json()
}

export async function functionCreateTask(task: {Task: string;}) {
  try {
    const res = await fetch("http://localhost:8000/tasks/create_task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(task)
    });

    if (!res.ok) {
      // Пытаемся получить детализированную ошибку
      const errorData = await res.json().catch(() => null);
      
      // Логируем полную информацию об ошибке
      console.error("Full error response:", errorData);
      
      throw new Error(
        errorData?.detail?.[0]?.msg || 
        errorData?.message || 
        `Ошибка создания задачи: ${res.status}`
      );
    }

    return res.json();
  } catch (error) {
    console.error("Network error:", error);
    throw error;
  }
}

export async function functionDeleteTask(id: number) {
  try {
    const res = await fetch(`http://localhost:8000/tasks/delete_task_by_id/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      // Пытаемся получить детализированную ошибку
      const errorData = await res.json().catch(() => null);
      
      // Логируем полную информацию об ошибке
      console.error("Full error response:", errorData);
      
      throw new Error(
        errorData?.detail?.[0]?.msg || 
        errorData?.message || 
        `Ошибка удаления задачи: ${res.status}`
      );
    }
    return res.json()
  } catch (e) {
    console.error("Ошибка сети при удалении:", e);
    throw e;
  }
}

export async function functionUpdateTask(id: number, updatedTask: {Task: string}) {
  try {
    const res = await fetch(`http://localhost:8000/tasks/update_task_by_id/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedTask)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("Full error response:", errorData);
      throw new Error(
        errorData?.detail?.[0]?.msg || 
        errorData?.message || 
        `Ошибка обновления задачи: ${res.status}`
      );
    }
    return res.json()
  } catch (e) {
    console.error("Ошибка сети при обновлении:", e);
    throw e;
  }
}

export async function testAllEndpoints() {
  const endpoints = [
    "http://localhost:8000/tasks/get_all_tasks",
    "http://localhost:8000/tasks/create_task", 
    "http://localhost:8000/tasks/delete_task_by_id",
    "http://localhost:8000/tasks/delete",
    "http://localhost:8000/tasks/remove",
    "http://localhost:8000/tasks/remove_task",
    "http://localhost:8000/task/delete",
    "http://localhost:8000/task/remove",
    "http://localhost:8000/api/tasks/delete",
    "http://localhost:8000/api/tasks/remove"
  ];

  console.log("🔍 Тестируем все возможные эндпоинты...");
  
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { method: "GET" });
      console.log(`✅ ${endpoint}: ${res.status} ${res.statusText}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: Ошибка сети`);
    }
  }
}