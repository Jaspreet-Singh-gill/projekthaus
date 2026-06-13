import react from "react"
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import Layout from "./layout.jsx"
import Home from "./pages/home/home.jsx"
import Login from "./pages/auth/login.jsx"

const route = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />}>
      </Route>
      <Route path="login" element={<Login />} />
    </Route>
  )
)

function App() {
  return (
    <>
     <RouterProvider router={route}/>
    </>
  )
}

export default App
