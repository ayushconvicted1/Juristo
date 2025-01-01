"use client";

import { useContext, useState } from "react";
import { MyContext } from "@/context/MyContext";
import toast from "react-hot-toast";
import { HashLoader } from "react-spinners";

const ChatBot = () => {
  const { user } = useContext(MyContext);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [docxUrl, setDocxUrl] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  console.log(user.userId);
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // const response = await fetch("http://localhost:5000/api/legaldocs/questions", {
      const response = await fetch(
        "https://juristo-backend-azure.vercel.app/api/legaldocs/questions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userInput, country: user.country.label }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        toast.error("Failed to fetch questions.");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Unable to fetch questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer.");
      return;
    }
    const newAnswers = [
      ...answers,
      {
        question: questions[currentQuestionIndex],
        answer: currentAnswer.trim(),
      },
    ];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleGenerate(newAnswers);
    }
  };

  const handleGenerate = async (answersToGenerate) => {
    try {
      setLoading(true);
      // const response = await fetch("http://localhost:5000/api/legaldocs/generate", {
      const response = await fetch(
        "https://juristo-backend-azure.vercel.app/api/legaldocs/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            answers: answersToGenerate,
            country: user.country.label,
            userInput: userInput,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuestions([]);
        setPdfUrl(
          URL.createObjectURL(
            new Blob(
              [Uint8Array.from(atob(data.pdf), (c) => c.charCodeAt(0))],
              {
                type: "application/pdf",
              }
            )
          )
        );

        setDocxUrl(
          URL.createObjectURL(
            new Blob(
              [Uint8Array.from(atob(data.docx), (c) => c.charCodeAt(0))],
              {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              }
            )
          )
        );
      } else {
        toast.error("Failed to generate document.");
      }
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Unable to generate document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">
          Legal Document Generator
        </h1>

        {!questions.length && !pdfUrl && (
          <>
            <textarea
              placeholder="Provide a short description of your requirement..."
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onChange={(e) => setUserInput(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={fetchQuestions}
              disabled={loading}
              className={`w-full ${
                loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {loading ? (
                <HashLoader size={20} color="#fff" />
              ) : (
                "Generate Questions"
              )}
            </button>
          </>
        )}

        {questions.length > 0 &&
          currentQuestionIndex < questions.length &&
          !pdfUrl && (
            <div className="text-center mt-4">
              <h2 className="text-lg font-medium text-gray-700">
                {questions[currentQuestionIndex]}
              </h2>
              <input
                type="text"
                className="w-full mt-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={loading}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAnswerSubmit}
                  disabled={loading || !currentAnswer.trim()}
                  className={`${
                    loading || !currentAnswer.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white py-2 px-4 rounded-md`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>
      {loading && (
        <HashLoader
          size={30}
          color="#00BFFF"
          loading={loading}
          className="mt-6"
        />
      )}

      {pdfUrl && (
        <iframe
          src={pdfUrl}
          width="100%"
          height="600px"
          className="mt-6"
          title="PDF Preview"
        ></iframe>
      )}

      {docxUrl && (
        <a
          href={docxUrl}
          download="document.docx"
          className="mt-4 inline-block bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
        >
          Download DOCX
        </a>
      )}
    </div>
  );
};

export default ChatBot;
