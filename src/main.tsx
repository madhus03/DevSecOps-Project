import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./CustomClassNameSetup";

import MainLoadingScreen from "./components/MainLoadingScreen";
import router from "./routes";
import store from "./store";
import { extendedApi } from "./store/slices/configuration";
import palette from "./theme/palette";

store.dispatch(extendedApi.endpoints.getConfiguration.initiate(undefined));

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <ThemeProvider theme={createTheme({ palette })}>
        <RouterProvider
          router={router}
          fallbackElement={<MainLoadingScreen />}
        />
      </ThemeProvider>
    </React.StrictMode>
  </Provider>
);