import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import OpenAI from "openai";
import mammoth from "mammoth";
import { Legaldocs } from "../models/Legaldocs.js";

export const handler = async (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://juristo-sigma.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  try {
    if (req.method === "POST") {
      const { action } = req.query;

      if (action === "generate-questions") {
        await generateQuestions(req, res);
      } else if (action === "create-document") {
        await createDocument(req, res);
      } else {
        res.status(400).json({ error: "Invalid action specified." });
      }
    } else if (req.method === "GET") {
      const { action } = req.query;

      if (action === "get-documents") {
        await getAllDocumentsByUserId(req, res);
      } else {
        res.status(400).json({ error: "Invalid action specified." });
      }
    } else {
      res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error) {
    console.error("Error in API handler:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

const generateQuestions = async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { userInput, country } = req.body;

    if (!userInput || !country) {
      return res
        .status(400)
        .json({ error: "User input and country are required." });
    }

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a legal assistant generating tailored questions to create detailed legal documents. Focus on providing only the 3-4 most critical and relevant questions needed to gather essential details.",
        },
        {
          role: "user",
          content: `Generate only 3-4 focused questions to gather key details for a legal document in ${country} based on the following input: ${userInput}`,
        },
      ],
      max_tokens: 300,
    });

    const questions = aiResponse.choices[0].message.content
      .trim()
      .split("\n")
      .filter(Boolean);

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions." });
  }
};

const createDocument = async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { userId, answers, userInput, country } = req.body;

    if (!userId || !answers || !userInput || !country) {
      return res
        .status(400)
        .json({
          error: "User ID, answers, user input, and country are required.",
        });
    }

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional legal assistant with expertise in drafting various legal documents. Your task is to create thorough, clear, and sensible legal documents for any type of agreement or legal form (such as contracts, policies, terms of service, non-disclosure agreements, etc.). The document must be comprehensive, properly structured, and legally sound, tailored to the laws and requirements of the user's country that is ${country}. Each document should be at least 3-5 pages long, with logically divided sections, and cover all essential legal provisions.`,
        },
        {
          role: "user",
          content: `Based on the following user input and answers, generate a detailed legal document tailored for ${country}: 
                  User Input: ${userInput}
                  Answers: ${JSON.stringify(answers)}`,
        },
      ],
      max_tokens: 5000,
    });

    const legalText = aiResponse.choices[0].message.content.trim();
    const docxBuffer = await generateDocx(legalText);
    const pdfBuffer = await generatePDF(legalText);
    const previewResult = await mammoth.convertToHtml({ buffer: docxBuffer });

    const document = new Legaldocs({ userId, userInput, answers, country });
    await document.save();

    res.status(200).json({
      preview: previewResult.value,
      docx: Buffer.from(docxBuffer).toString("base64"),
      pdf: Buffer.from(pdfBuffer).toString("base64"),
    });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document." });
  }
};

const getAllDocumentsByUserId = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const documents = await Legaldocs.find({ userId }).populate(
      "userId",
      "name email"
    );
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents." });
  }
};

const generatePDF = async (text) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const textLines = text.split("\n");
  let y = 750;

  textLines.forEach((line) => {
    if (y < 50) {
      page = pdfDoc.addPage([600, 800]);
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

const generateDocx = async (text) => {
  const doc = new Document({
    sections: [{ children: createFormattedParagraphs(text) }],
  });
  return await Packer.toBuffer(doc);
};

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
