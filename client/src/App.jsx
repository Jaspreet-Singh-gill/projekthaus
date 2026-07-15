import react from "react"
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import Layout from "./layout.jsx"
import Home from "./pages/home/home.jsx"
import Login from "./pages/auth/login.jsx"
import Register from "./pages/auth/register.jsx"
import WaitingPage from "./pages/auth/emailVerificationPage.jsx"
import ForgetPasswordPage from "./pages/auth/forgetPassword.jsx"
import ResetPasswordPage from "./pages/auth/resetPassword.jsx"
import { ProtectedRoute, NonProtectedRoutes } from "./components/protectedRoutes/protectedRoute.jsx";
import { Dashboard } from "./pages/dashboard/dashboard.jsx"
import { AllProjects } from "./pages/projects/allProjects.jsx";
import ProjectDashBoard from "./pages/projects/projectDashboard.jsx";
import ProjectAnalytics from "./pages/projects/projectAnalytics.jsx";
import JoinProject from "./pages/projects/joinProject.jsx";
import RegisterAndJoin from "./pages/projects/registerAndJoin.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ListOfTasks from "./pages/taskDashBoard/aLLTheTaskpage.jsx";
import TaskDashBoard from "./pages/taskDashBoard/taskDashBoard.jsx";
import SubTaskDasboard from "./pages/subTaskDashBoard/subTaskDashBoardPage.jsx";
import ListOfNotes from "./pages/notesDashboard/listOfNotes.jsx";
import NoteMainDashBoard from "./pages/notesDashboard/notesContent.jsx";
import { useEffect } from "react"
import ProfilePage from "./pages/profile/profile.jsx";
const queryClient = new QueryClient();

const route = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route element={<NonProtectedRoutes />}>
        <Route path="" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forget-password" element={<ForgetPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="waitingPage/:token" element={<WaitingPage />} />
        <Route path="/project/:projectId/register-and-join" element={<RegisterAndJoin />} />
        <Route path="/project/:projectId/join-the-project/:token" element={<JoinProject />} />
      </Route>

      {/* protected routes */}
      <Route element={<ProtectedRoute />} >
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/allprojects" element={<AllProjects />} />
        <Route path="/project/:projectId" element={<ProjectDashBoard />} />
        <Route path="/project/:projectId/analytics" element={<ProjectAnalytics />} />

        <Route path="/project/:projectId/get-all-tasks" element={< ListOfTasks />} />
        <Route path="/project/:projectId/task/:taskId" element={<TaskDashBoard />} />
        <Route path="/project/:projectId/task/:taskId/subtask/:subTaskId" element={<SubTaskDasboard />} />
        <Route path="/project/:projectId/notes" element={<ListOfNotes />} />
        <Route path="/project/:projectId/:noteId/note" element={<NoteMainDashBoard />} />
      </Route>
    </Route>
  )
)
function App() {

  return (
    <>

    </>
  )
}

export default App
