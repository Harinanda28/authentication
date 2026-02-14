import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleForgot = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      alert("OTP sent to email");
      navigate("/reset-password", { state: { email } });

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />
      <button onClick={handleForgot}>Send OTP</button>
    </div>
  );
}

export default ForgotPassword;
