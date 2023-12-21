import { type AppType } from "next/app";

import { api } from "@/utils/api";
import ContextProvider from "./context";

import "@/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ContextProvider>
      <Component {...pageProps} />
    </ContextProvider>
  );
};

export default api.withTRPC(MyApp);
