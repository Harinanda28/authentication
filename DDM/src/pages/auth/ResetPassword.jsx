import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleReset = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { email, otp, newPassword }
      );

      alert("Password reset successful");
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input
        placeholder="OTP"
        onChange={(e) => setOtp(e.target.value)}
      />
      <br /><br />
      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <br /><br />
      <button onClick={handleReset}>Reset Password</button>
    </div>
  );
}

export default ResetPassword;
