import { useNavigate } from "react-router-dom";
import "../styles/components/UserModal.css";
import { useState, useEffect } from "react";
import { API_USER_ME } from "../config";
import axios from "axios";

function UserModal({ user }) {
    const nav = useNavigate();
    const [loggedInUserName, setLoggedInUserName] = useState(null);
    const token = localStorage.getItem('accessToken');

    // 로그인한 유저 정보 가지고 오기
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const response = await axios.get(API_USER_ME, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("로그인한 유저 : ", response.data.data.userName);
                setLoggedInUserName(response.data.data.userName);
            } catch (error) {
                console.error('사용자 정보를 가져오는 데 실패했습니다:', error);
            }
        };

        if (token) {
            fetchUserName();
        }
    }, [token]);

    return (
        <div className="UserModal">
            <p>안녕하세요 👋</p>
            <p><strong>{user.nickname} </strong> 님!</p>
            <div className="coin-section">
                보유코인 : {user.reward}
            </div>
            <div
                onClick={() => nav(`/letter/${loggedInUserName}`)}
                className="myPage-section">
                <div className="icon">
                    <img src="src/assets/mail.png" />
                </div>
                <span>내 편지함</span>
            </div>
            <div
                onClick={() => nav("/password")}
                className="password-section">
                <div className="icon">
                    <img src="src/assets/padlock.png" />
                </div>
                <span>비밀번호 수정</span>
            </div>
            <div
                onClick={() => {
                    localStorage.removeItem("accessToken");
                    alert("로그아웃이 완료되었습니다.")
                    nav("/login");
                }}
                className="logout-section">
                <div className="icon">
                    <img src="src/assets/logout.png" />
                </div>
                <span>로그아웃</span>
            </div>
        </div>
    );
}

export default UserModal;
