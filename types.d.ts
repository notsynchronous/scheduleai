// Types
type CalendarEvent = {
  name: string;
  startTime: string;
  endTime: string;
  eventId: string;
  isGenerated?: boolean;
};

type Event = {
  name: string;
  startTime: string;
  endTime: string;
};


type Task = {
  name: string;
  // isHabit: boolean;
  freq: number;
  duration: number; //in minutes % 5;
};


export { CalendarEvent, Task, Event };
