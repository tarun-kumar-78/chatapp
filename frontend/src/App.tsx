import { BrowserRouter, Route, Routes } from "react-router"
import Register from "./pages/Register"
import Login from "./pages/Login"
import { Toaster } from "sonner"
import Home from './pages/Home';
import { Provider } from "react-redux";
import store from '@/store/index';
import ResetPassword from "./components/auth/ResetPassword";
import PublicRoute from "./components/auth/PublicRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
const App = () => {
  return (
    <>

      <Toaster position="top-right" richColors />
      <Provider store={store}>

        <BrowserRouter>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
            </Route>
          </Routes>

        </BrowserRouter>
      </Provider>
    </>
  )
}

export default App