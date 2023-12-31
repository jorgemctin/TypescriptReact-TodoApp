import { useEffect, useReducer } from 'react';
import { TodoFilters } from '../src/consts';
import { fetchTodos, updateTodos } from '../src/services/services';
import { type ListOfTodos, type filterValue } from '../src/types';

const initialState = {
    sync: false,
    todos: [],
    filterSelected: (() => {
        // read from url query params using URLSearchParams
        const params = new URLSearchParams(window.location.search)
        const filter = params.get('filter') as filterValue | null
        if (filter === null) return TodoFilters.all
        // check filter is valid, if not return ALL
        return Object
            .values(TodoFilters)
            .includes(filter)
            ? filter
            : TodoFilters.all
    })()
}

type Action =
    | { type: 'initTodos', payload: { todos: ListOfTodos } }
    | { type: 'clearCompleted' }
    | { type: 'completed', payload: { id: string, completed: boolean } }
    | { type: 'filterChange', payload: { filter: filterValue } }
    | { type: 'remove', payload: { id: string } }
    | { type: 'save', payload: { title: string } }
    | { type: 'updateTitle', payload: { id: string, title: string } }

interface State {
    sync: boolean
    todos: ListOfTodos
    filterSelected: filterValue
}

const reducer = (state: State, action: Action): State => {
    if (action.type === 'initTodos') {
        const { todos } = action.payload
        return {
            ...state,
            sync: false,
            todos
        }
    }

    if (action.type === 'clearCompleted') {
        return {
            ...state,
            sync: true,
            todos: state.todos.filter((todo) => !todo.completed)
        }
    }

    if (action.type === 'completed') {
        const { id, completed } = action.payload
        return {
            ...state,
            sync: true,
            todos: state.todos.map((todo) => {
                if (todo.id === id) {
                    return {
                        ...todo,
                        completed
                    }
                }

                return todo
            })
        }
    }

    if (action.type === 'filterChange') {
        const { filter } = action.payload
        return {
            ...state,
            sync: true,
            filterSelected: filter
        }
    }

    if (action.type === 'remove') {
        const { id } = action.payload
        return {
            ...state,
            sync: true,
            todos: state.todos.filter((todo) => todo.id !== id)
        }
    }

    if (action.type === 'save') {
        const { title } = action.payload
        const newTodo = {
            id: crypto.randomUUID(),
            title,
            completed: false
        }

        return {
            ...state,
            sync: true,
            todos: [...state.todos, newTodo]
        }
    }

    if (action.type === 'updateTitle') {
        const { id, title } = action.payload;
        return {
            ...state,
            sync: true,
            todos: state.todos.map((todo) => {
                if (todo.id === id) {
                    return {
                        ...todo,
                        title
                    };
                };

                return todo
            }),
        };
    };

    return state
};

export const useTodos = (): {
    activeCount: number
    completedCount: number
    todos: ListOfTodos
    filterSelected: filterValue
    handleClearCompleted: () => void
    handleCompleted: (id: string, completed: boolean) => void
    handleFilterChange: (filter: filterValue) => void
    handleRemove: (id: string) => void
    handleSave: (title: string) => void
    handleUpdateTitle: (params: { id: string, title: string }) => void
} => {
    const [{ sync, todos, filterSelected }, dispatch] = useReducer(reducer, initialState)

    const handleCompleted = (id: string, completed: boolean): void => {
        dispatch({ type: 'completed', payload: { id, completed } })
    }

    const handleRemove = (id: string): void => {
        dispatch({ type: 'remove', payload: { id } })
    }

    const handleUpdateTitle = ({ id, title }: { id: string, title: string }): void => {
        dispatch({ type: 'updateTitle', payload: { id, title } })
    }

    const handleSave = (title: string): void => {
        dispatch({ type: 'save', payload: { title } });
    }

    const handleClearCompleted = (): void => {
        dispatch({ type: 'clearCompleted' })
    }

    const handleFilterChange = (filter: filterValue): void => {
        dispatch({ type: 'filterChange', payload: { filter } })

        const params = new URLSearchParams(window.location.search)
        params.set('filter', filter)
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
    }

    const filteredTodos = todos.filter(todo => {
        if (filterSelected === TodoFilters.active) {
            return !todo.completed
        }

        if (filterSelected === TodoFilters.completed) {
            return todo.completed
        }

        return true
    })

    const completedCount = todos.filter((todo) => todo.completed).length
    const activeCount = todos.length - completedCount

    useEffect(() => {
        fetchTodos()
            .then(todos => {
                dispatch({ type: 'initTodos', payload: { todos } })
            })
            .catch(err => { console.error(err) })
    }, [])

    useEffect(() => {
        if (sync) {
            updateTodos({ todos }).catch(err => { console.error(err) })
        }
    }, [todos, sync])

    return {
        activeCount,
        completedCount,
        filterSelected,
        handleClearCompleted,
        handleCompleted,
        handleFilterChange,
        handleRemove,
        handleSave,
        handleUpdateTitle,
        todos: filteredTodos
    }
}