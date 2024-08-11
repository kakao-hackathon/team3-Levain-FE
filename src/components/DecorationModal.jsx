import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/DecorationModal.css';
import lockedIcon from '../assets/locked.png';
import { API_ICONS, API_USER_ME, API_PURCHASE } from '../config';
import axios from 'axios';

function DecorationModal({ isVisible, onClose, onSelect, userName }) {
    const [selectedId, setSelectedId] = useState(null);
    const [coins, setCoins] = useState(0);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [purchaseOrnament, setPurchaseOrnament] = useState(null);
    const [unlockedOrnaments, setUnlockedOrnaments] = useState([]);
    const navigate = useNavigate();
    const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
    const [ornaments, setOrnaments] = useState([]);
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        const fetchIcons = async () => {
            try {
                const response = await axios.get(API_ICONS, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    console.log(response.data.data)
                    const fetchedOrnaments = response.data.data.map(icon => ({
                        id: icon.iconId,
                        image: `http://localhost:8080${icon.iconPath}`,
                        name: icon.iconName,
                        locked: !icon.purchased,
                        price: icon.price
                    }));

                    const freeOrnaments = fetchedOrnaments
                        .filter(ornament => ornament.price === 0)
                        .map(ornament => ornament.id);

                    const purchasedOrnaments = fetchedOrnaments
                        .filter(ornament => !ornament.locked)
                        .map(ornament => ornament.id);

                    setOrnaments(fetchedOrnaments);
                    setUnlockedOrnaments([...purchasedOrnaments, ...freeOrnaments]);
                }
            } catch (error) {
                console.error('Failed to fetch icons:', error);
            }
        };

        fetchIcons();
    }, [token]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseUserMe = await axios.get(API_USER_ME, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(responseUserMe.data.data)
                setCoins(responseUserMe.data.data.reward);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchData();
    }, [token]);

    const handleSelect = (ornament) => {
        if (ornament.locked && !unlockedOrnaments.includes(ornament.id)) {
            setPurchaseOrnament(ornament);
            setShowPurchaseModal(true);
            return;
        }
        if (selectedId === ornament.id) {
            setSelectedId(null);
            setIsNextButtonDisabled(true);
        } else {
            setSelectedId(ornament.id);
            setIsNextButtonDisabled(false);
        }
    };

    const handlePurchase = async () => {
        if (purchaseOrnament && (coins >= purchaseOrnament.price || purchaseOrnament.price === 0)) {
            try {
                const response = await axios.post(API_PURCHASE, {
                    iconId: purchaseOrnament.id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    setCoins(coins - purchaseOrnament.price);
                    setUnlockedOrnaments([...unlockedOrnaments, purchaseOrnament.id]);
                    setShowPurchaseModal(false);
                    setSelectedId(purchaseOrnament.id);
                    setIsNextButtonDisabled(false);
                } else {
                    console.error('Failed to purchase ornament:', response.status);
                }
            } catch (error) {
                console.error('Error during purchase:', error);
            }
        } else if (purchaseOrnament.price > 0) {
            alert('코인이 부족합니다.');
            setShowPurchaseModal(false);
        } else {
            alert('구매 오류가 발생했습니다.');
            setShowPurchaseModal(false);
        }
    };

    const handleAdd = () => {
    if (!isNextButtonDisabled) {
        onSelect(selectedId);
    }
};

    const closePurchaseModal = () => {
        setShowPurchaseModal(false);
        setPurchaseOrnament(null);
    };

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    const renderOrnaments = () => {
        return ornaments.map((ornament) => (
            <div
                key={ornament.id}
                className={`ornament-item ${selectedId === ornament.id ? 'selected' : ''} ${ornament.locked && !unlockedOrnaments.includes(ornament.id) ? 'locked' : ''}`}
                onClick={() => handleSelect(ornament)}
            >
                <div
                    className="ornament-background"
                    style={{ backgroundImage: `url(${ornament.image})` }}
                >
                    {ornament.locked && !unlockedOrnaments.includes(ornament.id) && coins < ornament.price && (
                        <div className="locked-overlay">
                            <img src={lockedIcon} alt="잠김 아이콘" className="locked-icon" />
                        </div>
                    )}
                </div>
                <p className="ornament-text">{ornament.name}</p>
            </div>
        ));
    };

    if (!isVisible) return null;

    return (
        <div className="decoration-modal" onClick={onClose}>
            <div className="decoration-modal-content" onClick={stopPropagation}>
                {showPurchaseModal ? (
                    <>
                        <span className="decoration-close-button" onClick={closePurchaseModal}>&times;</span>
                        <div className="purchase-modal-content">
                            <img src={purchaseOrnament.image} alt={purchaseOrnament.name} className="modal-image" />
                            <p className="purchase-modal-name">{purchaseOrnament.name}</p>
                            <p className="purchase-modal-price">{purchaseOrnament.price}원</p>
                            <p className="current-coins">보유 코인: {coins}원</p>
                            <div className="purchase-modal-buttons">
                                <button className="purchase-button" onClick={closePurchaseModal}>닫기</button>
                                <button className="purchase-button" onClick={handlePurchase}>구매하기</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="decoration-close-button" onClick={onClose}>&times;</span>
                        <h2>르방이 장식을 골라주세요</h2>
                        <p>보유 코인: {coins}원</p>
                        <div className="ornament-container">
                            {renderOrnaments()}
                        </div>
                        <button
                            className={`decoration-next-button ${isNextButtonDisabled ? 'disabled' : ''}`}
                            onClick={handleAdd}
                            disabled={isNextButtonDisabled}
                        >
                            추가
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default DecorationModal;