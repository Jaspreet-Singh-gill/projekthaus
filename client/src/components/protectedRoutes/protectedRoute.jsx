import React, { useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ProtectedRoute = () => {

    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (!user) {
            toast.error("You are not authorized to access this page");
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        }
    }, [user]);

    if (!user) {
        toast.error("You are not authorized to access this page");
        navigate("/login");
        return null;
    }
    return <Outlet />;

}

export const NonProtectedRoutes = () => {

    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user]);

    if (user) {
        navigate("/dashboard");
        return null;
    }
    return <Outlet />;

}