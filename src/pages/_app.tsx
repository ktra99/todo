import { loadingAtom, userAtom } from "@src/atoms";
import "@src/styles/globals.css";
import { auth } from "@src/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAtom } from "jotai";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import GoogleAnalytics from "@src/components/g4a";

export default function App({ Component, pageProps }: AppProps) {
  const [_user, setUser] = useAtom(userAtom);
  const [_loading, setLoading] = useAtom(loadingAtom);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
  }, []);
  return (
    <>
      <GoogleAnalytics />
      <Component {...pageProps} />
    </>
  );
}
