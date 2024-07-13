import { Link } from "react-router-dom"
import Input from "../components/Input"

function Login() {
    return (
        <div className="Login">
            <form>
                <div className="login-title">로그인</div>
                <div className="login-notice">초기 비밀번호는</div>
                <div className="input-section">
                    <Input
                        placeholder="id"
                        type="text"
                    />
                    <Input
                        placeholder="password"
                        type="password"
                    />
                </div>
                <Link to='/password'>비밀번호 변경</Link>
            </form>
        </div>
    )
}

export default Login