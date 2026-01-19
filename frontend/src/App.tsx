import { BrowserRouter, Route, Routes } from "react-router"
import Register from "./pages/Register"
import Login from "./pages/Login"
import { Toaster } from "sonner"
import Home from './pages/Home';
import { Provider } from "react-redux";
import store from '@/store/index';

const App = () => {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Provider store={store}>

        <BrowserRouter>
          <Routes>

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
          </Routes>

        </BrowserRouter>
      </Provider>
    </>
  )
}

export default App