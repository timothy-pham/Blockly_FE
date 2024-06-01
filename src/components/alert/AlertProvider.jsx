import React, { createContext, useState, useContext, useEffect } from "react";
import { socket } from "../../socket";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { milisecondToSecondMinute } from "../../utils/transform";
const AlertContext = createContext({
    showAlert: false,
    type: "",
    message: "",
    setAlert: () => { },
});

const AlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({ showAlert: false, type: "", message: "" });

    const setAlert = (showAlert, type = "", message = "") => {
        setAlertState({ showAlert, type, message });
        if (showAlert) {
            toast(`${message}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                type: type || "default",
            });
        }
    };

    useEffect(() => {
        socket.on("receive_notification", (data) => {
            setAlert(true, data?.type, data?.message);
        });

        socket.on("new_winner", (data) => {
            setAlert(true, "default", `🎉🎉🎉 Chúc mừng ${data?.user?.user_data?.name} \nvừa chiến thắng với ${data?.user?.score} điểm\n trong ${milisecondToSecondMinute(data?.user?.end_time)}!`);
        });
        return () => {
            socket.off("receive_notification");
            socket.off("new_winner");
        };
    }, [socket]);

    return (
        <AlertContext.Provider value={{ ...alertState, setAlert }}>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                stacked={true}
            />


        </AlertContext.Provider>
    );
};

export { AlertProvider, AlertContext };

