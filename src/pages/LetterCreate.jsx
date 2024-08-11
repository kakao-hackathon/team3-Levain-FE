import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/pages/LetterCreate.css';
import { API_LETTERS } from '../config';

const LetterCreate = () => {
    const { userName } = useParams();
    const location = useLocation();
    const ornamentId = location.state?.ornamentId;
    const ornamentImage = location.state?.ornamentImage;
    const [flipCard, setFlipCard] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [formData, setFormData] = useState({
        from: '',
        message: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        if (formData.from && formData.message) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid) {
            alert("모든 입력값은 필수입니다.");
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.post(API_LETTERS, {
                content: formData.message,
                writer: formData.from,
                iconId: ornamentId,
                receiver: userName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            //console.log(response);

            setFlipCard(!flipCard);
            setTimeout(() => {
                navigate(`/letter/${userName}`, { state: { ornamentId, from: formData.from, ornamentImage } });
            }, 3000);
        } catch (error) {
            console.error('Error sending letter:', error);
        }
    };

    const handleGoBack = () => {
        navigate(`/letter/${userName}`);
    };

    return (
        <div id="container">
            <div className="contact-wrapper">
                <div className={`envelope ${flipCard ? 'active' : ''}`}>
                    <div className="back paper"></div>
                    <div className="content">
                        <div className="form-wrapper">
                            <form onSubmit={handleSubmit}>
                                <div className="top-wrapper">
                                    <div className="letter-receiver">
                                        <label>To.</label>
                                        <div className='receiver'>{userName}</div>
                                    </div>
                                    <div className="input">
                                        <label>From.</label>
                                        <input
                                            type="text"
                                            name="from"
                                            maxLength="5"
                                            placeholder="최대 5글자"
                                            value={formData.from}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="bottom-wrapper">
                                    <div className="input">
                                        <label>Message</label>
                                        <textarea
                                            rows="5"
                                            name="message"
                                            maxLength="200"
                                            placeholder="최대 200자"
                                            value={formData.message}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                    <div className="submit">
                                        <button type="submit" className="submit-card">Send Letter</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="front paper"></div>
                </div>
            </div>
        </div>
    );
};

export default LetterCreate;