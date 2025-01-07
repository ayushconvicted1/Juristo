import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import OpenAI from "openai";
import mongoose from "mongoose";
import { Legaldocs } from "@/lib/db/models/Legaldocs";
import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";

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

    const systemMessage = `You are a professional legal assistant... tailored for ${country}.`;
    const userMessage = `Based on the following user input and answers:
    
    User Input: ${userInput}
    Answers: ${JSON.stringify(answers)}`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: userMessage }],
      max_tokens: 5000,
    });

    const legalText = aiResponse?.choices?.[0]?.message?.content?.trim();
    if (!legalText || legalText.length < 10) {
      throw new Error("Generated document content is too short or invalid.");
    }

    const pdfContent = `${legalText}`;
    const pdfBuffer = await generatePDF(pdfContent);
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

const generatePDF = async (text) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const textLines = text.split("\n");
  let y = 750;

  for (const line of textLines) {
    if (y < 50) {
      const newPage = pdfDoc.addPage([600, 800]);
      y = 750;
    }
    page.drawText(line, {
      x: 50,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  }

  return Buffer.from(await pdfDoc.save());
};

const uploadToCloudinary = async (pdfBuffer) => {
  const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dc9msi1wn/auto/upload";
  const formData = new FormData();
  formData.append("file", pdfBuffer, { filename: "document.pdf" });
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
