import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import OpenAI from "openai";
import mammoth from "mammoth";
import mongoose from "mongoose";
import { Legaldocs } from "@/lib/db/models/Legaldocs";
import dotenv from "dotenv";

dotenv.config();

// Database connection function
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("Database connection failed");
  }
}

export async function POST(req) {
  try {
    // Connect to the database
    await connectToDatabase();

    const { userId, answers, userInput, country } = await req.json();

    if (!userId || !answers || !userInput || !country) {
      return NextResponse.json(
        { error: "User ID, answers, user input, and country are required." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000,
    });

    // Prepare the messages for the API call
    const systemMessage = `You are a professional legal assistant with expertise in drafting various legal documents. Your task is to create thorough, clear, and sensible legal documents for any type of agreement or legal form (such as contracts, policies, terms of service, non-disclosure agreements, etc.). The document must be comprehensive, properly structured, and legally sound, tailored to the laws and requirements of the user's country that is ${country}. Each document should be at least 3-5 pages long, with logically divided sections, and cover all essential legal provisions.`;

    const userMessage = `Based on the following user input and answers, generate a detailed legal document tailored for ${country}: 
                  User Input: ${userInput}
                  Answers: ${JSON.stringify(answers)}`;

    // Function to estimate token count (this is a rough estimate)
    const estimateTokenCount = (text) => {
      return Math.ceil(text.split(/\s+/).length * 1.3);
    };

    const systemTokens = estimateTokenCount(systemMessage);
    const userTokens = estimateTokenCount(userMessage);
    const totalInputTokens = systemTokens + userTokens;

    // Adjust max_tokens based on input token count
    const maxOutputTokens = Math.min(4096 - totalInputTokens, 4000);

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      max_tokens: maxOutputTokens,
    });

    const legalText = aiResponse.choices[0].message.content.trim();
    const docxBuffer = await generateDocx(legalText);
    const pdfBuffer = await generatePDF(legalText);
    const previewResult = await mammoth.convertToHtml({ buffer: docxBuffer });

    const document = new Legaldocs({ userId, userInput, answers, country });
    await document.save({ timeout: 60000 });

    return NextResponse.json({
      preview: previewResult.value,
      docx: Buffer.from(docxBuffer).toString("base64"),
      pdf: Buffer.from(pdfBuffer).toString("base64"),
    });
  } catch (error) {
    console.error("Error in API route:", error);

    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        {
          error: "Database error. Please try again later.",
          details: error.message,
        },
        { status: 503 }
      );
    }

    if (error instanceof OpenAI.APIError) {
      if (error.code === "context_length_exceeded") {
        return NextResponse.json(
          {
            error:
              "The input is too long. Please provide a shorter description or fewer answers.",
            details: error.message,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Error generating document content.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred.", details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to generate a DOCX document
const generateDocx = async (text) => {
  const doc = new Document({
    sections: [{ children: createFormattedParagraphs(text) }],
  });
  return await Packer.toBuffer(doc);
};

// Helper function to generate a PDF document
const generatePDF = async (text) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const textLines = text.split("\n");
  let y = 750;

  textLines.forEach((line) => {
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
  });

  return Buffer.from(await pdfDoc.save());
};

// Helper function to format paragraphs for DOCX
const createFormattedParagraphs = (text) => {
  const paragraphs = [];
  const lines = text.split("\n");

  lines.forEach((line) => {
    if (line.trim() === "") {
      paragraphs.push(new Paragraph({ text: " ", spacing: { after: 200 } }));
    } else if (line.startsWith("**") && line.endsWith("**")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/\*\*/g, ""),
          bold: true,
          spacing: { after: 200 },
          alignment: AlignmentType.LEFT,
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 100 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  });

  return paragraphs;
};
