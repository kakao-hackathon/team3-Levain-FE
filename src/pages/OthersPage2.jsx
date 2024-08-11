import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../styles/pages/OthersPage.css';
import roomImage from '../assets/room.png';
import levainImage from '../assets/levain.png';
import DecorationModal from '../components/DecorationModal';
import searchImage from "../assets/search.png";
import buttonLeftImage from '../assets/button-left.png';
import buttonRightImage from '../assets/button-right.png';
import axios from 'axios';
import { API_LETTERS, API_USER_ME } from '../config';

const positions = [
    { transform: 'translate(-220%, -60%)' },
    { transform: 'translate(-180%, -200%)' },
    { transform: 'translate(-55%, -290%)' },
    { transform: 'translate(80%, -200%)' },
    { transform: 'translate(120%, -60%)' },
    { transform: 'translate(-135%, 80%)' },
    { transform: 'translate(30%, 80%)' }
];

function OthersPage2() {
    const { userName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [letters, setLetters] = useState([]);
    const [loggedInUserName, setLoggedInUserName] = useState('');
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

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

        fetchLetters(currentPage);
    }, [currentPage, userName, token]);

    // 페이지 주인의 편지 리스트 가지고 오기
    const fetchLetters = async (page) => {
        try {
            const apiEndpoint = `${API_LETTERS}?page=${page}&userName=${userName}`;
            const response = await axios.get(apiEndpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('편지 리스트:', response.data.data.content);
            const lettersData = response.data.data.content;
            setLetters(lettersData);
            setHasNext(response.data.data.hasNext);
            setHasPrevious(response.data.data.hasPrevious);
        } catch (error) {
            console.error('GET 요청 실패:', error);
            setLetters([]);
        }
    }

    useEffect(() => {
        if (location.state && location.state.ornamentId && location.state.from) {
            const newLetter = {
                letterId: Date.now(), // 고유한 letterId를 임시로 생성
                ornamentId: location.state.ornamentId,
                from: location.state.from
            };
            setLetters(prevLetters => [...prevLetters, newLetter]);
        }
        if (location.state && location.state.message) {
            alert(`새 편지: ${location.state.message}`);
        }
    }, [location.state]);

    const handleOpenModal = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleSelectOrnament = (id) => {
        console.log("선택한 장식 ID : ", id)
        navigate(`create`, { state: { ornamentId: id } });
    };

    const handleNextLevain = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePreviousLevain = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 0)); // 페이지가 0 이하로 내려가지 않도록 설정
    };

    const currentLetters = Array.isArray(letters) ? letters.slice(0, 7) : [];
    const isOwner = loggedInUserName === userName;

    return (
        <div className="container" style={{ backgroundImage: `url(${roomImage})` }}>
            <img
                src={searchImage}
                alt="Search"
                className="search-button"
                onClick={() => navigate('/main')}
            />
            <img src={levainImage} alt="돌하르방 이미지" className="levain-image" />
            {!isOwner && (
                <button className="create-letter" onClick={handleOpenModal}>
                    <span>편지 쓰기</span>
                </button>
            )}
            <DecorationModal
                isVisible={modalVisible}
                onClose={handleCloseModal}
                onSelect={handleSelectOrnament}
                userName={userName}
            />
            <div>{userName}</div>
            {currentLetters.map((letter, index) => {
                const position = positions[index];
                return (
                    <div key={letter.letterId} style={{ ...position, position: 'absolute', top: '50%', left: '50%', width: '80px', height: '80px', textAlign: 'center'}}>
                        {letter.iconPath && <img src={`http://localhost:8080${letter.iconPath}`} alt={`장식 ${index + 1}`} className="ornament-image" style={{ width: '100%', height: '100%'}} />}
                        <div className="ornament-text">{letter.writer}</div>
                    </div>
                );
            })}
            {hasPrevious && (
                <button className="button button-left" onClick={handlePreviousLevain}>
                    <img src={buttonLeftImage} alt="왼쪽 버튼" className="button-image" />
                </button>
            )}
            {hasNext && (
                <button className="button button-right" onClick={handleNextLevain}>
                    <img src={buttonRightImage} alt="오른쪽 버튼" className="button-image" />
                </button>
            )}
        </div>
    );
}

export default OthersPage2;
