import { Fragment, useEffect, useRef, useState, useContext } from "react";
import { api } from "@/utils/api";

// Components
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { Dialog, Menu, Transition } from "@headlessui/react";

// Utils
import format from "date-fns/format";
import {
  differenceInMinutes,
  isSameWeek,
  parseJSON,
  startOfWeek,
} from "date-fns";
import { Reorder } from "framer-motion";
import { MyContext } from "@/pages/context";
import { Task, type CalendarEvent } from "types";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const generateSpan = (dateL: string, dateR: string) => {
  return String((differenceInMinutes(parseJSON(dateL), parseJSON(dateR)) / 5))
};

// TODO: Column funkiness with sm modifier
const generateColumn = (date: string) =>
  "relative mt-px flex col-start-" + (new Date(date).getDay() + 1);

const DAYS_OF_THE_WEEK = [
  {
    full: "Sunday",
    short: "S",
  },
  {
    full: "Monday",
    short: "M",
  },
  {
    full: "Tuesday",
    short: "T",
  },
  {
    full: "Wednesday",
    short: "W",
  },
  {
    full: "Thursday",
    short: "T",
  },
  {
    full: "Friday",
    short: "F",
  },
  {
    full: "Saturday",
    short: "S",
  },
];

const getTheStartOfTheWeek = (date: Date) => {
  return date.getDate() - date.getDay();
};

const generatePrompt = (tasks: Task[], events: CalendarEvent[], hours: string) => {
  const taskString = tasks
    .map(
      (task) =>
        `- A "${task.name}" task happens ${task.freq} times for ${task.duration} minutes.\n`,
    )
    .join("");
  
    // ONLY USE EVENTS FROM THIS WEEK
    const eventString = events
    .map(
      (event) =>
        `- A "${event.name}" task happens at ${format(parseJSON(event.startTime), 'PPpp')} til ${format(parseJSON(event.endTime), 'PPpp')}\n`,
    )
    .join("");

  return `I need a schedule for the rest of the week of ${startOfWeek(
    new Date(),
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })} with the following information:


  - All events happen between 9AM and 5PM UTC -5.
  - Nothing should be planned for Tuesday.
  - There should be 30 minutes a least between events.
  - There are existing events that should not be overwritten.

  ${eventString}
  
  - Formatted like this: schedule: [{ name: "", startTime: "YYYY-MM-DDTHH:mm:ss.sssZ", endTime: "startTime + duration as YYYY-MM-DDTHH:mm:ss.sssZ", duration: "15" }] 

  ${taskString}`;
};

const generateColorClasses = () => {
  const colors = [
    "bg-gray-50 hover:bg-gray-100 text-gray-700",
    "bg-red-50 hover:bg-red-100 text-red-700",
    "bg-yellow-50 hover:bg-yellow-100 text-yellow-700",
    "bg-green-50 hover:bg-green-100 text-green-700",
    "bg-blue-50 hover:bg-blue-100 text-blue-700",
    "bg-indigo-50 hover:bg-indigo-100 text-indigo-700",
    "bg-purple-50 hover:bg-purple-100 text-purple-700",
    "bg-pink-50 hover:bg-pink-100 text-pink-700",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomBgColorBody = () => {
  const clr = generateColorClasses();
  return (
    "group absolute inset-1 flex flex-col overflow-clip  rounded-lg p-2 text-xs leading-5 " +
    clr
  );
};

 
const generateTheWeek = (date: Date) => {
  const days = DAYS_OF_THE_WEEK.map((curDay, i) => {
    const day = new Date(date);
    day.setDate(date.getDate() + i);
    const classString =
      new Date().toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }) ===
      day.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
        ? "ml-1.5 flex h-5 w-5 items-center justify-center rounded bg-indigo-600 font-semibold text-white"
        : "ml-1.5 items-center justify-center font-semibold text-gray-900";

    return (
      <div key={i} className="flex items-center justify-center py-3">
        <span className="flex items-baseline">
          {curDay.full.slice(0, 3)}{" "}
          <span className={classString}>{day.getDate()}</span>
        </span>
      </div>
    );
  });
  return days;
};

const TaskCreateModal = ({
  open: isOpen,
  close,
}: {
  open: boolean;
  close: () => void;
}) => {
  const { addTask } = useContext(MyContext);
  const [task, setTask] = useState<Task>({
    name: "",
    // isHabit: false,
    duration: 15,
    freq: 1,
  });

  return (
    <Dialog
      open={isOpen}
      onClose={() => close()}
      className="relative z-50 font-[Inter]"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-4">
          {/* <Dialog.Title>Deactivate account</Dialog.Title> */}
          {/* <Dialog.Description>
          This will permanently deactivate your account
        </Dialog.Description> */}
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Create Task
          </h3>
          <p className="text-sm text-gray-500">Blah blah blah blah blah</p>
          <div className="my-4 flex flex-col">
            <input
              value={task.name}
              onChange={(e) =>
                setTask((prev) => ({ ...prev, name: e.target.value }))
              }
              type="text"
              name="name"
              id="name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Task Name"
            />
            <input
              type="number"
              name="duration"
              id="duration"
              min={0}
              step={15}
              value={task.duration}
              onChange={(e) =>
                setTask((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value, 10),
                }))
              }
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Length of task (minutes)"
            />
            {/* <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  checked={task.isHabit}
                  onChange={(e) =>
                    setTask((prev) => ({ ...prev, isHabit: e.target.checked }))
                  }
                  id="isHabit"
                  aria-describedby="habit"
                  name="isHabit"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="isHabit" className="font-medium text-gray-900">
                  Is this task a habit
                </label>
              </div>
            </div> */}
            <input
              type="number"
              name="freq"
              id="freq"
              min={1}
              value={task.freq}
              onChange={(e) =>
                setTask((prev) => ({
                  ...prev,
                  freq: parseInt(e.target.value, 10),
                }))
              }
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Weekly frequency"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                {
                  addTask(task);
                  close();
                }
              }}
              type="button"
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Create Task
            </button>
            <button
              onClick={() => close()}
              type="button"
              className="ml-4 rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

interface Schedule {
  schedule: CalendarEvent[];
}

interface ParsedContent {
  id: string;
  content: string;
}

const WeekView = ({}) => {
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  // const [globalEvents, setGlobalEvents] = useState(EVENTS);
  const {
    events: globalEvents,
    tasks,
    updateTaskState: setTasks,
    updateEventState: setGlobalEvents,
  } = useContext(MyContext);
  const [isTaskEditOpen, setIsTaskEditOpen] = useState(false);
  const chat = api.ai.create.useMutation({
    onSuccess: (data: ParsedContent) => {
      const content = data.content;
      const { schedule }: Schedule = JSON.parse(content) as Schedule;
      setGlobalEvents(schedule);
    },
  });

  const container = useRef(null);
  const containerNav = useRef(null);
  const containerOffset = useRef(null);

  // Fires AFTER initial render
  useEffect(() => {


    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(getTheStartOfTheWeek(today)); // Start of the current week (Sunday)

    setWeekStart(startOfWeek);
  }, []);

  useEffect(() => {

    // Set the container scroll position based on the current time.
    const currentMinute = new Date().getHours() * 60;
    // container.current.scrollTop =
    //   ((container.current.scrollHeight -
    //     containerNav.current.offsetHeight -
    //     containerOffset.current.offsetHeight) *
    //     currentMinute) /
    //   1440;
  }, []);

  return (
    <div className="flex h-full flex-col h-full">
      {isTaskEditOpen && (
        <TaskCreateModal
          open={isTaskEditOpen}
          close={() => setIsTaskEditOpen(false)}
        />
      )}
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time
            dateTime={`${weekStart.getFullYear()}-${
              weekStart.getMonth() + 1 < 10
                ? "0" + weekStart.getMonth() + 1
                : weekStart.getMonth() + 1
            }`}
          >{`${weekStart.toLocaleString("default", {
            month: "long",
          })} ${weekStart.getFullYear()}`}</time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              onClick={() => {
                const t = weekStart;
                t.setDate(weekStart.getDate() - 7);
                setWeekStart(() => new Date(t));
              }}
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Previous week</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* TODO: When clicked set weekStart to this week */}
            <button
              onClick={() => {
                const t = new Date();
                t.setDate(getTheStartOfTheWeek(t));
                setWeekStart(() => new Date(t));
              }}
              type="button"
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              onClick={() => {
                const t = weekStart;
                t.setDate(weekStart.getDate() + 7);
                setWeekStart(() => new Date(t));
              }}
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Next week</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <Menu.Button
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Week view
                <ChevronDownIcon
                  className="-mr-1 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm",
                          )}
                        >
                          Day view
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm",
                          )}
                        >
                          Week view
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <div className="ml-6 h-6 w-px bg-gray-300" />
            <button
              onClick={() => setIsTaskEditOpen(true)}
              type="button"
              className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add Task
            </button>

            <button
              onClick={() => {
                chat.mutate({ prompt: generatePrompt(tasks, globalEvents, "") });
                // alert(generatePrompt());
              }}
              type="button"
              className="ml-3 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {chat.isLoading ? "Loading" : "Make Prompt"}
            </button>
            {/* EVENT */}
            <button
              onClick={() => {
                console.log()
              }}
              type="button"
              className="ml-3 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Persist Events
            </button>
          </div>

          <Menu as="div" className="relative ml-6 md:hidden">
            <Menu.Button className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">Open menu</span>
              <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm",
                        )}
                      >
                        Create event
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm",
                        )}
                      >
                        Go to today
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm",
                        )}
                      >
                        Day view
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm",
                        )}
                      >
                        Week view
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm",
                        )}
                      >
                        Month view
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm",
                        )}
                      >
                        Year view
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>
      <div className="flex flex-row divide-x h-full">
        <div
          ref={container}
          className="isolate flex flex-auto flex-col overflow-auto bg-white"
        >
          <div
            style={{ width: "165%" }}
            className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full"
          >
            <div
              ref={containerNav}
              className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8"
            >
              {/* MOBILE VIEW */}
              <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
                {DAYS_OF_THE_WEEK.map((day) => (
                  <button
                    key={day.full}
                    type="button"
                    className="flex flex-col items-center pb-3 pt-2"
                  >
                    {day.short}{" "}
                    <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                      10
                    </span>
                  </button>
                ))}
              </div>

              {/* DESKTOP */}
              <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
                <div className="col-end-1 w-14" />
                {generateTheWeek(weekStart)}
              </div>
            </div>
            <div className="flex flex-auto">
              <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
              <div className="grid flex-auto grid-cols-1 grid-rows-1">
                {/* Horizontal lines */}
                <div
                  className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                  style={{
                    gridTemplateRows: "repeat(48, minmax(3.5rem, 1fr))",
                  }}
                >
                  <div ref={containerOffset} className="row-end-1 h-7"></div>
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      12AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      1AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      2AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      3AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      4AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      5AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      6AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      7AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      8AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      9AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      10AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      11AM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      12PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      1PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      2PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      3PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      4PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      5PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      6PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      7PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      8PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      9PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      10PM
                    </div>
                  </div>
                  <div />
                  <div>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                      11PM
                    </div>
                  </div>
                  <div />
                </div>

                {/* Vertical lines */}
                <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                  <div className="col-start-1 row-span-full" />
                  <div className="col-start-2 row-span-full" />
                  <div className="col-start-3 row-span-full" />
                  <div className="col-start-4 row-span-full" />
                  <div className="col-start-5 row-span-full" />
                  <div className="col-start-6 row-span-full" />
                  <div className="col-start-7 row-span-full" />
                  <div className="col-start-8 row-span-full w-8" />
                </div>

                {/* Events */}
                <ol
                  className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
                  style={{
                    gridTemplateRows:
                      "1.75rem repeat(288, minmax(0, 1fr)) auto",
                  }}
                >
                  {/* (12 * ) + 2, Find minutes * /5 = span */}
                  {globalEvents.map(
                    (event, i) =>
                      isSameWeek(weekStart, parseJSON(event.startTime)) && (
                        <li
                          key={event.name + i + "_"}
                          style={{
                            gridRow: `${(parseJSON(event.startTime).getHours() * 12) + 2} / span ${generateSpan(event.endTime, event.startTime)}`,
                          }}
                          className={classNames(
                            generateColumn(event.startTime),
                          )}
                        >
                          {/* (new Date(event.startTime).getMinutes() > 0 ? new Date(event.startTime).getMinutes() / 5 : 0) + */}
                          <a href="#" className={getRandomBgColorBody()}>
                            <p className="order-1 font-semibold">
                              {event.name}
                            </p>
                            <p>
                              <time
                                dateTime={format(
                                  new Date(event.startTime),
                                  "yyyy-MM-dd",
                                )}
                              >
                                {format(parseJSON(event.startTime), "h:mm a")}
                              </time>
                            </p>
                          </a>
                        </li>
                      ),
                  )}
                  {/* Column is based on day of the week. Row is..  */}
                  {/* The board is divided by 5 (30 min = 6 span , 1 span = 5 minutes) */}
                </ol>
              </div>
            </div>
          </div>
        </div>
        {/* TASKS */}
        <div className="w-96 p-4">
          <Reorder.Group
            role="list"
            className="space-y-3"
            axis="y"
            values={tasks}
            onReorder={setTasks}
          >
            {tasks.map((item, i) => (
              <Reorder.Item
                className="flex flex-col overflow-hidden rounded-lg bg-white px-3 py-2 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                key={item.name + "_" + i}
                value={item}
              >
                <span className="text-sm ">{item.name}</span>
                <span className="text-xs text-gray-500">
                  Duration: {item.duration} minutes
                </span>
                <span className="text-xs text-gray-500">
                  Frequency: {item.freq} times
                </span>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
