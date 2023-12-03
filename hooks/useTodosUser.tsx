import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { TodoFilters } from '../src/consts';
import { getAllMyTodos, createTodo, updateTodoText, updateTodoCompleted, deleteTodo  } from '../src/services/ApiCalls';
import { UserData, type Todo as TodoType, ApiResponse, filterValue } from '../src/types';


interface TodosUser {
  todos: TodoType[];
  addTodo: (text: string) => void;
  updateCompleted: (id: number, completed: boolean) => void;
  removeTodo: (id: number) => void;
  updateText: (params: { id: number; text: string }) => void;
  setFilter: (filter: filterValue) => void;
  activeCount: number;
  completedCount: number;
  handleFilterChange: (filter: filterValue) => void;
  handleClearCompleted: () => void;
}

export const useTodosUser = ():TodosUser => {
    const [todos, setTodos] = useState<TodoType[]>([]);
  const [filter, setFilter] = useState<filterValue>(TodoFilters.all);
  const { credentials: { token }, data: { userId } } = useSelector((state: UserData) => state.user);

  useEffect(() => {
    // Lógica para obtener todas las tareas del usuario cuando el componente se monta
    getAllMyTodos(userId, token).then((response) => {
        setTodos(response.data.todos); 
    });
}, [userId]);

  const addTodo = (text: string) => {
    createTodo({ text, user_id: userId }, token)
        .then((response) => {
          console.log("Todo created", response);
          
          const responseData = response.data as ApiResponse;
          setTodos((prevTodos) => [...prevTodos, responseData.todo]);
        })
        .catch((error) => {
            console.error('Error creating todo:', error);
        });
};

const updateText = (params: { id: number; text: string }) => {
  console.log('Updating text for todo with id:', params.id);
  
  const { id, text } = params;
  const newText = text.trim();

  updateTodoText(id, newText, token)
    .then((response) => {
      console.log('Update successful. Response:', response);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, text: response.data.todo.text } : todo
        )
      );
    })
    .catch((error) => {
      console.error('Error updating todo text:', error);
    });
};

  const updateCompleted = (id: number, completed: boolean) => {
    // Lógica para actualizar el estado completado de una tarea
    updateTodoCompleted(id, completed, token)
      .then((response) => {
        // Actualizar el estado de las tareas después de la actualización
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === id ? { ...todo, completed: response.data.todo.completed } : todo
          )
        );
      })
      .catch((error) => {
        console.error('Error updating todo completed state:', error);
      });
  };

  const removeTodo = (id: number) => {
    deleteTodo(id, token)
        .then(() => {
            setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
        })
        .catch((error) => {
            console.error('Error al borrar el todo:', error);
        });
};

// Función para filtrar los todos según el filtro seleccionado
const filterTodos = (todos: TodoType[]): TodoType[] => {
  switch (filter) {
    case TodoFilters.active:
      return todos.filter((todo) => !todo.completed);
    case TodoFilters.completed:
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
};

const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  const handleFilterChange = (filter: filterValue) => {
    setFilter(filter);
  };


  const handleClearCompleted = () => {
    const completedTodoIds = todos
      .filter((todo) => todo.completed)
      .map((completedTodo) => completedTodo.id);
  
    // Actualiza la lista de todos excluyendo los completados
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
  
    // Llama a la función removeTodo para eliminar los todos completados en el servidor
    completedTodoIds.forEach((id) => removeTodo(id));
  };
    return{ 
        updateText,
        updateCompleted,
        removeTodo,
        todos: filterTodos(todos),
        // filter,
        setFilter,
        activeCount,
        completedCount,
        addTodo,
        handleFilterChange,
        handleClearCompleted
    }
}