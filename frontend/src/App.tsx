import { BrowserRouter, Route, Routes } from "react-router"
import Register from "./pages/Register"
import Login from "./pages/Login"
import { Toaster } from "sonner"
import Home from './pages/Home';
import { useDispatch } from "react-redux";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import api from "./service/axios";
import { getErrMessage } from "./utils/getErrMessage";
import { setLogin } from "./store/auth/authSlice";
import { addUser } from "./store/user/userSlice";

const App = () => {
  const dispatch = useDispatch();
  const checkAuth = async () => {
    try {
      const response = await api.get("/api/user/check-auth")
      if (response.status == 200) {
        dispatch(setLogin(true));
        dispatch(addUser(response.data.user));
      }
    } catch (err) {
      const errMsg = getErrMessage(err);
      console.log(errMsg)
    }
  }
  checkAuth();

  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App