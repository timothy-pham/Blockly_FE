import { toast } from "react-toastify";
import { apiPost } from "../utils/dataProvider";
import { toastOptions } from "../constant/toast";
import { Button } from "@mui/material";

const RequestAdmin = () => {

    const requestAdmin = async (value) => {
        if (value.key) {
            try {
                const res = await apiPost("users/request-admin", {
                    key: value?.key
                });
                if (res && res.success) {
                    toast.success("Yêu cầu thành công, vui lòng đăng nhập lại!\nTự động đăng xuất sau 3 giây!", toastOptions);
                    setTimeout(() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }, 3000);
                }
            } catch (e) {
                toast.error(`Error: ${e.message}`, toastOptions);
            }
        } else {
            alert("Please input key!");
        }
    }
    // form to input key and submit
    return (
        <div className="container-body">
            <div className="p-4 bg-white rounded-lg shadow-lg"
                style={{
                    width: "400px", margin: "0 auto",
                    height: "fit-content", marginTop: "100px"
                }}
            >
                <h1 className="text-2xl font-bold mb-4 text-black text-center">Yêu cầu quyền admin</h1>
                <p className="text-black">
                    Nếu bạn muốn trở thành admin, vui lòng liên hệ Email: <a href="mailto:phamtiendat.dev@gmail.com">
                        phamtiendat.dev@gmail.com
                    </a>
                </p>
                <div className="my-5">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="key">Key</label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="key"
                        type="text"
                        placeholder="Key"
                    />
                </div>
                <div className="flex items-center justify-center">
                    <Button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        variant="contained"
                        type="button"
                        onClick={() => {
                            requestAdmin({
                                key: document.getElementById('key').value
                            })
                        }}
                    >
                        Xác nhận
                    </Button>
                </div>

            </div>
        </div>
    );
}

export default RequestAdmin;