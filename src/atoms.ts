import { db } from "@src/utils/firebase";
import { User } from "firebase/auth";
import { collection, getDocs, query, QueryDocumentSnapshot, where } from "firebase/firestore";
import { atom } from "jotai";

export const loadingAtom = atom<boolean>(true);
export const userAtom = atom<User | null>(null);
export const taskAtom = atom<QueryDocumentSnapshot[]>([]);
export const fetchTaskAtom = atom((get) => get(taskAtom), async (_get, set) => {
  const querySnapshot = await getDocs(
    query(collection(db, "tasks"), where("uid", "==", _get(userAtom)?.uid))
  );
  set(taskAtom, querySnapshot.docs);
})