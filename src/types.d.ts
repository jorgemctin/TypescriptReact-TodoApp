import { TodoFilters } from "./consts"

export interface Todo {
    id: number,
    title: string,
    completed: boolean
}

export type TodoId = Pick<Todo, 'id'>
export type TodoTitle = Pick<Todo, 'title'>
export type TodoCompleted = Pick<Todo, 'completed'>



export type ListOfTodos = Todo[]

export type filterValue = typeof TodoFilters[keyof typeof TodoFilters]