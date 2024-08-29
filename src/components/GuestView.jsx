import { useState, StrictMode, useContext, useEffect } from "react";
import AuthContext from "../pages/auth/AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";

export const GuestView = () => {
    const navigate = useNavigate();
    const { isGuestView, cancelGuestView } = useContext(AuthContext);
    const handleExitGuestMode = () => {
        cancelGuestView();
        navigate("/admin/userManagement")
    }
    return (
        <div
            style={{
                position: "fixed",
                top: 20,
                left: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                zIndex: 1000,
                padding: 20,
                borderRadius: 20,
                cursor: "pointer",
                display: isGuestView ? "block" : "none",
            }}
            className="border-animation"
            onClick={handleExitGuestMode}
        >
            <h1>Thoát chế độ khách</h1>
        </div>
    )
}