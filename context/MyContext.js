"use client";
import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

const MyContext = createContext();

const MyProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState({
    value: "IN",
    label: "India",
  });
  const [selectedLanguage, setSelectedLanguage] = useState({
    value: "EN",
    label: "English",
  });
  const [chats, setChats] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          console.log("T O K E N", token);
          const decoded = jwt.decode(token);
          const email = decoded?.email;

          if (email) {
            fetchUserData(email);
          } else {
            console.error("Email not found in token");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      } else {
        console.log("No token found, redirecting to login");
        router.push("/login");
      }
    }
  }, [router]);

  const fetchUserData = async (email) => {
    try {
      const response = await fetch(
        `https://juristo-backend-azure.vercel.app/api/users/get/${email}`
        // `http://localhost:5000/api/users/get/${email}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      setUser(data);
      fetchChats(data);
      setSelectedCountry(data.country);
      setSelectedLanguage(data.language);
      console.log("Fetched user data:", data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchChats = async (user) => {
    const data = await fetch(
      `https://juristo-backend-azure.vercel.app/api/chat/${user.userId}`
      // `http://localhost:5000/api/chat/${user.userId}`
    ).then((res) => res.json());
    setChats(data.reverse());
  };

  const fetchDocChats = async (user) => {
    const data = await fetch(
      `https://juristo-backend-azure.vercel.app/api/chat/${user.userId}`
      // `http://localhost:5000/api/image-chat/${user.userId}`
    ).then((res) => res.json());
    setChats(data.reverse());
  };

  return (
    <MyContext.Provider
      value={{
        user,
        setUser,
        fetchUserData,
        setSelectedChat,
        selectedChat,
        chats,
        setChats,
        fetchChats,
        fetchDocChats,
        setSelectedCountry,
        selectedCountry,
        setSelectedLanguage,
        selectedLanguage,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export { MyContext, MyProvider };
