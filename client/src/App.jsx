import react from "react"
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import Layout from "./layout.jsx"
import Home from "./pages/home/home.jsx"
import Login from "./pages/auth/login.jsx"
import Register from "./pages/auth/register.jsx"
import WaitingPage from "./pages/auth/emailVerificationPage.jsx"
import ForgetPasswordPage from "./pages/auth/forgetPassword.jsx"
import ResetPasswordPage from "./pages/auth/resetPassword.jsx"
import { ProtectedRoute } from "./components/protectedRoutes/protectedRoute.jsx";
import { Dashboard } from "./pages/dashboard/dashboard.jsx"
import ProjectDashBoard from "./pages/projects/projectDashboard.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ListOfTasks from "./pages/taskDashBoard/aLLTheTaskpage.jsx"
const queryClient = new QueryClient();

const route = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />

      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forget-password" element={<ForgetPasswordPage />} />
      <Route path="reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="waitingPage/:token" element={<WaitingPage />} />


      {/* protected routes */}
      <Route element={<ProtectedRoute />} >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:projectId" element={<ProjectDashBoard />} />
        <Route path="/project/:projectId/get-all-tasks" element={< ListOfTasks />} />
      </Route>
    </Route>
  )
)

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={route} />
      </QueryClientProvider>
    </>
  )
}

export default App
