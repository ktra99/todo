import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  BarsArrowUpIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  RectangleStackIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import { ClockIcon } from "@heroicons/react/24/outline";
import { fetchTaskAtom, loadingAtom, taskAtom, userAtom } from "@src/atoms";
import Loading from "@src/components/loading";
import { auth, db } from "@src/utils/firebase";
import clsx from "clsx";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  updateDoc,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import { format, formatDistance } from "date-fns";

function Navbar() {
  return (
    <div className="p-4">
      <nav className="flex items-center justify-between" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="https://www.ktra99.dev/" className="-m-1.5 p-1.5">
            <span className="sr-only">Ktra99</span>
            <img className="h-6 w-6" src="/logo.png" alt="avatar" />
          </a>
        </div>
        <div className="flex flex-1 justify-end">
          <a
            href="https://github.com/ktra99/todo"
            className="text-sm font-semibold leading-6 text-gray-900"
            target="_blank"
            rel="noreferrer"
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-500"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </nav>
    </div>
  );
}

function Account() {
  const [user] = useAtom(userAtom);
  const [tasks] = useAtom(taskAtom);
  const [open, setOpen] = useState(false);
  const [_, fetchTasks] = useAtom(fetchTaskAtom);
  const currentTime = (time: Date) => {
    return time.getTime();
  };
  const handleOnSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      task: { value: string };
      deadline: { value: string };
    };
    const task = target.task.value;
    const deadline = target.deadline.value;
    try {
      await addDoc(collection(db, "tasks"), {
        task,
        deadline,
        starred: false,
        uid: user?.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setOpen(false);
      fetchTasks();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:p-6">
                  <form onSubmit={handleOnSubmit} className="space-y-8">
                    <div className="space-y-8">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CalendarDaysIcon
                          className="h-6 w-6 text-green-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          Add task
                        </Dialog.Title>
                      </div>
                      <div>
                        <label
                          htmlFor="task"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Task
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="task"
                            id="task"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 sm:text-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="deadline"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Deadline
                        </label>
                        <div className="mt-1">
                          <input
                            type="datetime-local"
                            name="deadline"
                            id="deadline"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 sm:text-sm"
                            defaultValue={format(
                              new Date(
                                currentTime(new Date()) + 60 * 60 * 1000
                              ),
                              "yyyy-MM-dd hh:mm"
                            )}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="bg-white xl:w-64 xl:flex-shrink-0">
        <div className="py-6 pl-4 pr-6 sm:pl-6 lg:pl-8 xl:pl-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-8">
              <div className="space-y-8 sm:flex sm:items-center sm:justify-between sm:space-y-0 xl:block xl:space-y-8">
                <div className="flex items-center space-x-3">
                  <div className="relative h-12 w-12 flex-shrink-0">
                    {user?.photoURL ? (
                      <img
                        className="h-12 w-12 rounded-full"
                        src={user.photoURL}
                        alt=""
                      />
                    ) : (
                      <span className="absolute inset-0 rounded-full bg-gray-400 motion-safe:animate-pulse"></span>
                    )}
                  </div>
                  <div className="space-y-1 sm:w-32">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.displayName}
                    </div>
                    <span className="block truncate text-sm font-medium text-gray-500 hover:text-gray-900">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row xl:flex-col">
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 xl:w-full"
                  >
                    New task
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut(auth)}
                    className="mt-3 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 sm:mt-0 sm:ml-3 xl:ml-0 xl:mt-3 xl:w-full"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <div className="flex flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-6">
                <div className="flex items-center space-x-2">
                  <CheckBadgeIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-gray-500">
                    Email verified
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <RectangleStackIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-gray-500">
                    {tasks.length} Tasks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Todo() {
  const [tasks] = useAtom(taskAtom);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [_, fetchTasks] = useAtom(fetchTaskAtom);
  const [currentTask, setCurrentTask] = useState<DocumentData | null>(null);
  const [sort, setSort] = useState<"Name" | "Date modified" | "Date created">(
    "Name"
  );
  const sortByName = (a: string, b: string) => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };
  const sortByDate = (a: Date, b: Date) => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };
  const tasklist = useMemo(() => {
    switch (sort) {
      case "Name":
        return [...tasks].sort((a, b) =>
          sortByName(a.data().task, b.data().task)
        );
      case "Date modified":
        return [...tasks].sort((a, b) =>
          sortByDate(a.data().updatedAt, b.data().updatedAt)
        );
      case "Date created":
        return [...tasks].sort((a, b) =>
          sortByDate(a.data().createdAt, b.data().createdAt)
        );
      default:
        return tasks;
    }
  }, [sort, tasks]);
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      fetchTasks();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  const handleStarred = async (id: string, starred: boolean) => {
    try {
      await updateDoc(doc(db, "tasks", id), {
        starred,
        updateAt: new Date(),
      });
      fetchTasks();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  const handleOnSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      task: { value: string };
      deadline: { value: string };
    };
    const task = target.task.value;
    const deadline = target.deadline.value;
    try {
      await updateDoc(doc(db, "tasks", currentTask?.id), {
        task,
        deadline,
        updateAt: new Date(),
      });
      fetchTasks();
      setOpen(false);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:p-6">
                  <form onSubmit={handleOnSubmit} className="space-y-8">
                    <div className="space-y-8">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <PencilSquareIcon
                          className="h-6 w-6 text-green-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          Update task
                        </Dialog.Title>
                      </div>
                      <div>
                        <label
                          htmlFor="task"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Task
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="task"
                            id="task"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 sm:text-sm"
                            defaultValue={currentTask?.data().task}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="deadline"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Deadline
                        </label>
                        <div className="mt-1">
                          <input
                            type="datetime-local"
                            name="deadline"
                            id="deadline"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 sm:text-sm"
                            defaultValue={currentTask?.data().deadline}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="bg-white lg:min-w-0 lg:flex-1">
        <div className="border-b border-t border-gray-200 pl-4 pr-6 pt-4 pb-4 sm:pl-6 lg:pl-8 xl:border-t-0 xl:pl-6 xl:pt-6">
          <div className="flex items-center">
            <h1 className="flex-1 text-lg font-medium">To-do list</h1>
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2">
                <BarsArrowUpIcon
                  className="mr-3 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                {sort}
                <ChevronDownIcon
                  className="ml-2.5 -mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Menu.Button>
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => setSort("Name")}
                        className={clsx(
                          active || sort === "Name"
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block w-full px-4 py-2 text-left text-sm"
                        )}
                      >
                        Name
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => setSort("Date modified")}
                        className={clsx(
                          active || sort === "Date modified"
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block w-full px-4 py-2 text-left text-sm"
                        )}
                      >
                        Date modified
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => setSort("Date created")}
                        className={clsx(
                          active || sort === "Date created"
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block w-full px-4 py-2 text-left text-sm"
                        )}
                      >
                        Date created
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center px-4 py-8">
            <div className="w-full">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-gray-900 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
                  placeholder="Search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <ul
          role="list"
          className="divide-y divide-gray-200 border-b border-gray-200"
        >
          <AnimatePresence>
            {tasklist
              .filter((task) =>
                task.data().task.toLowerCase().includes(search.toLowerCase())
              )
              .map((task) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    transition: {
                      duration: 0.25,
                      ease: "easeOut",
                    },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: {
                      duration: 0.25,
                      ease: "easeOut",
                    },
                  }}
                  className="relative"
                >
                  <div className="py-5 pl-4 pr-6 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6">
                    <div className="flex items-center justify-between space-x-4">
                      <div className="min-w-0 space-y-3">
                        <div className="flex items-center space-x-3">
                          <span
                            className={clsx(
                              task.data().starred
                                ? "bg-green-100"
                                : "bg-gray-100",
                              "relative flex h-4 w-4 items-center justify-center rounded-full"
                            )}
                            aria-hidden="true"
                          >
                            {task.data().starred && (
                              <span className="absolute h-2.5 w-2.5 rounded-full bg-green-400 motion-safe:animate-ping" />
                            )}
                            <span
                              className={clsx(
                                task.data().starred
                                  ? "bg-green-400"
                                  : "bg-gray-400",
                                "h-2 w-2 rounded-full"
                              )}
                            />
                          </span>
                          <h2 className="text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setOpen(true);
                                setCurrentTask(task);
                              }}
                              className="absolute inset-0"
                              aria-hidden="true"
                            />
                            {task.data().task}{" "}
                            <span className="sr-only">
                              {task.data().starred ? "Starred" : "Not starred"}
                            </span>
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(task.id)}
                          className="group relative flex items-center space-x-2.5"
                        >
                          <span className="truncate text-sm font-medium text-gray-500 group-hover:text-gray-900">
                            Mark as complete
                          </span>
                        </button>
                      </div>
                      <div className="sm:hidden">
                        <ChevronRightIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="hidden flex-shrink-0 flex-col items-end space-y-3 sm:flex">
                        <p className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleStarred(task.id, !task.data().starred)
                            }
                            className="relative rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                          >
                            <span className="sr-only">
                              {task.data().starred
                                ? "Add to favorites"
                                : "Remove from favorites"}
                            </span>
                            <StarIcon
                              className={clsx(
                                task.data().starred
                                  ? "text-yellow-300 hover:text-yellow-400"
                                  : "text-gray-300 hover:text-gray-400",
                                "h-5 w-5"
                              )}
                              aria-hidden="true"
                            />
                          </button>
                        </p>
                        <p className="flex space-x-2 text-sm text-gray-500">
                          <ClockIcon className="h-5 w-5" />
                          <span>
                            Due{" "}
                            {formatDistance(
                              new Date(task.data().deadline),
                              new Date(),
                              { addSuffix: true }
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
          </AnimatePresence>
        </ul>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { push } = useRouter();
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(loadingAtom);
  const [_, fetchTasks] = useAtom(fetchTaskAtom);
  useEffect(() => {
    if (!user) push("/");
    else fetchTasks();
  }, [user, push, fetchTasks]);
  return (
    <>
      <Head>
        <title>To-do - Dashboard</title>
      </Head>
      {loading && <Loading />}
      <Navbar />
      <div className="relative mb-10 flex min-h-full flex-col">
        <div className="mx-auto w-full max-w-7xl flex-grow lg:flex xl:px-8">
          <div className="min-w-0 flex-1 bg-white xl:flex">
            <Account />
            <Todo />
          </div>
        </div>
      </div>
    </>
  );
}
