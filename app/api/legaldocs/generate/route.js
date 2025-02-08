import { NextResponse } from "next/server";
import OpenAI from "openai";
import mongoose from "mongoose";
import { Legaldocs } from "@/lib/db/models/Legaldocs";
import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";
import { jsPDF } from "jspdf";
import { JSDOM } from "jsdom";
import { marked } from "marked";

dotenv.config();

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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 600000,
    });

    const systemMessage = `You are a professional legal assistant... tailored for ${country}. Please provide your response in properly formatted Markdown, ensuring correct indentation and structure for a professional PDF document.`;
    const userMessage = `Based on the following user input and answers, generate a legal document in Markdown format:
    
    User Input: ${userInput}
    Answers: ${JSON.stringify(answers)}`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      max_tokens: 5000,
    });

    const legalText = aiResponse?.choices?.[0]?.message?.content?.trim();
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
    const isAIError = error instanceof OpenAI.APIError;

    return NextResponse.json(
      {
        error: isMongooseError
          ? "Database error. Please try again later."
          : isAIError
          ? "Error generating document content."
          : "An unexpected error occurred.",
        details: error.message,
      },
      { status: isMongooseError ? 503 : isAIError ? 500 : 500 }
    );
  }
}

const generatePDF = async (markdownText) => {
  const html = marked(markdownText);
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const pdf = new jsPDF();
  const elements = document.body.children;
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
