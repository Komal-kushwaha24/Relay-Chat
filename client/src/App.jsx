import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Register from "./pages/Register";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />
      </Routes>
    </BrowserRouter>
  );
}