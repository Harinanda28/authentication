import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function OTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const handleVerify = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-register-otp",
        { email, otp }
      );

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div>
      <h2>OTP Verification</h2>
      <input
        placeholder="Enter OTP"
        onChange={(e) => setOtp(e.target.value)}
      />
      <br /><br />
      <button onClick={handleVerify}>Verify</button>
    </div>
  );
}

export default OTP;
