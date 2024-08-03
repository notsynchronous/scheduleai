import React, {
  type ReactNode,
  createContext,
  useState,
} from "react";
import { type CalendarEvent, type Task } from "types";
import { api } from "@/utils/api";

// Create a context
export const MyContext = createContext<{
  tasks: Task[];
  events: CalendarEvent[];
  updateTaskState: (newState: Task[]) => void;
  updateEventState: (newState: CalendarEvent[]) => void;
  addTask: (task: Task) => void;
}>({
  tasks: [],
  events: [],
  updateTaskState: function (newState: Task[]): void {
    throw new Error("Function not implemented.");
  },
  addTask: function (task: Task): void {
    throw new Error("Function not implemented.");
  },
  updateEventState: function (newState: CalendarEvent[]): void {
    throw new Error("Function not implemented.");
  },
});

const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const { data, isLoading } = api.task.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      setTasks(data);
    },
  });

  const { data: dbEvents, isLoading: eventsLoading } =
    api.event.fetchEvents.useQuery(undefined, {
      onSuccess: (data) => {
        setEvents(data);
      },
    });

  const utils = api.useUtils();

  const taskUpdate = api.task.create.useMutation({
    onSuccess: (data: Task) => {
      setTasks((prev) => [...prev, data]);
    },
  });

  if (isLoading || !data || !dbEvents || eventsLoading) {
    return children;
  }

  const addTask = (task: Task) => {
    taskUpdate.mutate({ task });
  };

  const updateTaskState = (newState: Task[]) => {
    setTasks([...newState]);
  };

  const updateEventState = (newState: CalendarEvent[]) => {
    setEvents((prevState) => ([...prevState, ...newState]));
  };

  return (
    <MyContext.Provider
      value={{ tasks, events, updateTaskState, updateEventState, addTask }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default ContextProvider;
