import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import { Legaldocs } from "@/lib/db/models/Legaldocs";
import axios from "axios";
import FormData from "form-data";
import { jsPDF } from "jspdf";
import { JSDOM } from "jsdom";
import { marked } from "marked";

// Ensure that this API route uses the Node.js runtime rather than the Edge runtime.
export const config = {
  runtime: "nodejs",
};

// Use dotenv only in non-production environments.
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Database connection function
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("Database connection failed");
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const requestData = await req.json().catch((error) => {
      console.error("Invalid JSON in request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    });

    const { userId, answers, userInput, country } = requestData;

    if (!userId || !answers || !userInput || !country) {
      return NextResponse.json(
        { error: "User ID, answers, user input, and country are required." },
        { status: 400 }
      );
    }

    // Initialize Gemini Client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const systemMessage = `You are a professional legal assistant... tailored for ${country}. Please provide your response in properly formatted Markdown, ensuring correct indentation and structure for a professional PDF document.`;
    const userMessage = `Based on the following user input and answers, generate a legal document in Markdown format:
    
User Input: ${userInput}
Answers: ${JSON.stringify(answers)}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
    });
    const result = await model.generateContent({
      contents: [
        {
          role: "user", // Gemini does not support "system"; using "user"
          parts: [{ text: systemMessage }],
        },
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    });

    const response = await result.response;
    const legalText = response.text().trim();

    if (!legalText || legalText.length < 10) {
      throw new Error("Generated document content is too short or invalid.");
    }

    const pdfBuffer = await generatePDF(legalText);
    const cloudinaryUrl = await uploadToCloudinary(pdfBuffer);

    const document = new Legaldocs({
      userId,
      userInput,
      answers,
      country,
      pdfUrl: cloudinaryUrl,
    });

    await document.save();

    return NextResponse.json({ pdfUrl: cloudinaryUrl });
  } catch (error) {
    console.error("Error in API route:", error);
    const isMongooseError = error instanceof mongoose.Error;
    const isGeminiError = error.message.includes("Gemini");

    return NextResponse.json(
      {
        error: isMongooseError
          ? "Database error. Please try again later."
          : isGeminiError
          ? "Error generating document content."
          : "An unexpected error occurred.",
        details: error.message,
      },
      { status: isMongooseError ? 503 : isGeminiError ? 500 : 500 }
    );
  }
}

const generatePDF = async (markdownText) => {
  const html = marked(markdownText);
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const pdf = new jsPDF();
  const elements = doc.body.children;
  let yOffset = 10;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const text = element.textContent.trim();

    if (element.tagName === "H1") {
      pdf.setFontSize(18);
      pdf.setFont(undefined, "bold");
    } else if (element.tagName === "H2") {
      pdf.setFontSize(16);
      pdf.setFont(undefined, "bold");
    } else if (element.tagName === "H3") {
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
    } else {
      pdf.setFontSize(12);
      pdf.setFont(undefined, "normal");
    }

    const splitText = pdf.splitTextToSize(text, 180);
    pdf.text(splitText, 10, yOffset);
    yOffset += splitText.length * 7;

    if (yOffset > 280) {
      pdf.addPage();
      yOffset = 10;
    }
  }

  return pdf.output("arraybuffer");
};

const uploadToCloudinary = async (pdfBuffer) => {
  const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dc9msi1wn/auto/upload";
  const formData = new FormData();
  formData.append("file", Buffer.from(pdfBuffer), { filename: "document.pdf" });
  formData.append("upload_preset", "wecofy");

  try {
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: formData.getHeaders(),
    });
    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload PDF to Cloudinary");
  }
};
