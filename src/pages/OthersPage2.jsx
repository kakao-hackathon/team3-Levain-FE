import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../styles/pages/OthersPage.css'; // 스타일을 여기서 가져옴
import roomImage from '../assets/room.png';
import levainImage from '../assets/levain.png';
import DecorationModal from '../components/DecorationModal';
import searchImage from "../assets/search.png";
import buttonLeftImage from '../assets/button-left.png';
import buttonRightImage from '../assets/button-right.png';
import axios from 'axios';
import { API_LETTERS, API_USER_ME } from '../config';

const positions = [
    { transform: 'translate(-190%, -80%)' },
    { transform: 'translate(-150%, -175%)' },
    { transform: 'translate(-50%, -240%)' },
    { transform: 'translate(50%, -175%)' },
    { transform: 'translate(90%, -80%)' },
    { transform: 'translate(-135%, 40%)' },
    { transform: 'translate(35%, 40%)' }
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
    const [selectedLetter, setSelectedLetter] = useState(null);

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
                letterId: Date.now(),
                ornamentId: location.state.ornamentId,
                from: location.state.from
            };
            setLetters(prevLetters => [...prevLetters, newLetter]);
        }
        if (location.state && location.state.message) {
            alert(`새 편지: ${location.state.message}`);
        }
    }, [location.state]);

    const handleOpenCreateLetterModal = () => {
        setSelectedLetter(null);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedLetter(null);
    };

    const handleSelectOrnament = (id) => {
        console.log("선택한 장식 ID : ", id)
        navigate(`/letter/create`, { state: { ornamentId: id } });
    };

    const handleLetterClick = async (letterId) => {
        console.log(`Fetching letter with ID: ${letterId}`);
        if (isOwner) {
            try {
                const response = await axios.get(`/api/letters/${letterId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Letter data:", response.data.data);
                setSelectedLetter(response.data.data);
                setModalVisible(true);
            } catch (error) {
                console.error('편지 내용을 가져오는 데 실패했습니다:', error);
            }
        } else {
            console.log("권한이 없습니다.");
        }
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
                <button className="create-letter" onClick={handleOpenCreateLetterModal}>
                    <span>편지 쓰기</span>
                </button>
            )}
            <div>{userName}</div>
            {currentLetters.map((letter, index) => {
                const position = positions[index];
                return (
                    <div
                        key={letter.letterId}
                        style={{
                            ...position,
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: 'fit-content',
                            height: 'fit-content',
                            textAlign: 'center',
                            cursor: isOwner ? 'pointer' : 'default', // 소유자만 pointer로
                        }}
                        onClick={() => handleLetterClick(letter.letterId)}
                    >
                        {letter.iconPath && <img src={`http://localhost:8080${letter.iconPath}`} alt={`장식 ${index + 1}`} className="ornament-image" />}
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

            {/* 편지 모달 */}
            {modalVisible && selectedLetter && (
                <div className="modal">
                    <div className="modal-content">
                        {selectedLetter.iconPath && (
                            <div className="modal-icon">
                                <img
                                    src={`http://localhost:8080${selectedLetter.iconPath}`}
                                    alt="편지 아이콘"
                                    className="modal-icon-image"
                                />
                            </div>
                        )}
                        <div className="modal-message">
                            <div>{selectedLetter.content}</div>
                            <div className="modal-from">from. {selectedLetter.writer}</div>
                        </div>
                        <button className="close-letter-button" onClick={handleCloseModal}>
                            닫기
                        </button>
                    </div>
                </div>
            )}

            {/* DecorationModal */}
            {modalVisible && !selectedLetter && (
                <DecorationModal
                    isVisible={modalVisible}
                    onClose={handleCloseModal}
                    onSelect={handleSelectOrnament}
                    userName={userName}
                />
            )}
        </div>
    );
}

export default OthersPage2;
