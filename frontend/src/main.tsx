import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {Toaster} from "react-hot-toast"
import { createTheme, ThemeProvider } from "@mui/material";
import {BrowserRouter} from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext.tsx";
import axios from "axios";


// Axios for making HTTP requests
axios.defaults.baseURL = "http://localhost:5000/api/v1";
axios.defaults.withCredentials = true;

const theme = createTheme({
  typography: {
    fontFamily: "Roboto slab , serif",
    allVariants: { color: "white" },
  },
});


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Toaster position="top-right" />
        <App />
      </ThemeProvider>
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);

