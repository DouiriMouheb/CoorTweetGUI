import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Description, Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
export default function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const loginUser = async (e) => {
    e.preventDefault();
    const { email, password } = data;
    try {
      const { data } = await axios.post("/login", {
        email,
        password,
      });
      if (data.error) {
        toast.error(data.error);
      } else {
        setData({});
        navigate("/dashboard");
        toast.success("Login Successful Welcome ^^");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const redirectToRegister = () => {
    navigate("/register"); // Redirect to the register page
  };
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Welcome to CoorTweet
        </h1>

        <form onSubmit={loginUser} className="space-y-4">
          <div>
            <label className="block text-gray-600 font-medium">Email:</label>
            <input
              type="text"
              placeholder="Enter Email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium">Password:</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={redirectToRegister}
            className="text-blue-600 hover:underline font-medium"
          >
            Go to Register Page
          </button>
        </div>
      </div>
    </div>
  );
}
