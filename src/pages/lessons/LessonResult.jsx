import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
    Table,
    TableBody,
    Paper,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { formatDateTime, getReview, milisecondToSecondMinute } from "../../utils/transform";
import { apiGetDetail } from "../../utils/dataProvider";
import "./lesson.css";
import { getLabel } from "../../utils/levelParse";
import { getTime } from "../../utils/generate";
export const LessonResult = () => {
    const navigate = useNavigate();
    const info = localStorage.getItem("authToken");
    const { user } = JSON.parse(info);
    // get id from url
    const { history_id } = useParams();
    const [histories, setHistories] = useState([]);
    const fetchHistory = async () => {
        try {
            const res = await apiGetDetail("histories", history_id);
            if (res) {
                setHistories(res);
            }
        } catch (e) {
            console.log("can not fetch history");
            console.log(e)
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getName = (name) => {
        if (!name) return "";
        const names = name.split(" ");
        const initials = names.map((n) => n.charAt(0).toUpperCase());
        return initials.join("");
    };

    const percentage = useMemo(() => {
        try {
            let percent = (histories?.meta_data?.score / histories?.meta_data?.total) * 100 || 0;
            return percent.toFixed(0);
        } catch (error) {
            return 0;
        }
    }, [histories]);

    const percentageComponent = useMemo(() => {
        return <div role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100" style={{ '--value': percentage }}></div >
    }, [percentage]);

    return (
        <div className="lesson-result container-body">
            <div className="container border-animation">
                <h1>{histories?.group?.name}</h1>
                <div className="result-summary">
                    {percentageComponent}
                    <div className="text-center">
                        <h2>{getReview(percentage)}</h2>
                    </div>
                    <button className="btn-continue" onClick={() => navigate(`/collections/${histories?.collection?.collection_id}`)}>Tiếp tục luyện tập</button>
                </div>

                <div className="flex flex-col justify-center items-center">
                    <div className="stats">
                        <div className="stat-item">
                            <h3>Thời gian bắt đầu</h3>
                            <p>{formatDateTime(histories?.meta_data?.start_time)}</p>
                        </div>
                        <div className="stat-item">
                            <h3>Thời gian hoàn thành</h3>
                            <p>{formatDateTime(histories?.meta_data?.end_time)}</p>
                        </div>
                        <div className="stat-item">
                            <h3>Thời gian thực hiện</h3>
                            <p>{getTime(histories?.meta_data?.start_time, histories?.meta_data?.end_time)}</p>
                        </div>
                        <div className="stat-item">
                            <h3>Trả lời đúng</h3>
                            <p>{histories?.meta_data?.score} / {histories?.meta_data?.total}</p>
                        </div>
                    </div>
                    <table>
                        <tr>
                            <th>STT</th>
                            <th>Nội dung câu hỏi</th>
                            <th>Kết quả</th>
                            <th>Điểm số</th>
                        </tr>
                        {histories?.blocks?.map((block, index) => {
                            const correct = histories?.result?.find((result) => result.block_id === block.block_id)?.correct;
                            return (
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{block?.question}</td>
                                    <td className={correct ? "correct" : "incorrect"}>{correct ? "✓" : "✗"}</td>
                                    <td>{correct ? 1 : 0}</td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td colspan="3">Tổng điểm</td>
                            <td>{histories?.meta_data?.score}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    );
};
