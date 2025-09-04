import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureGemini } from "../config/gemini-config.js";

export const generateChatCompletion = async (req: Request, res: Response) => {
  try {
    const { message: userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ message: "Message is required" });
    }

    const userId = res.locals.jwtData?.id;
    if (!userId) {
      console.error("JWT data missing", res.locals.jwtData);
      return res.status(401).json({ message: "Unauthorized: JWT missing or invalid" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for id:", userId);
      return res.status(401).json({ message: "User not found" });
    }

    // Collect conversation so far
    const chats = (user.chats || []).map(({ role, content }) => `${role}: ${content}`);
    chats.push(`user: ${userMessage}`);
    user.chats.push({ role: "user", content: userMessage });

    // Gemini setup
    const genAI = configureGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let chatResponse;
    try {
      // Combine chat history into a single prompt
      const prompt = chats.join("\n");
      const result = await model.generateContent(prompt);
      chatResponse = result.response.text();
    } catch (err: any) {
      console.error("Gemini API error:", err.message || err);
      return res.status(500).json({ message: "Gemini API error", details: err.message || err });
    }

    if (chatResponse) {
      user.chats.push({
        role: "assistant",
        content: chatResponse,
      });
    }

    await user.save();
    return res.status(200).json({ chats: user.chats });

  } catch (err: any) {
    console.error("Unhandled error in generateChatCompletion:", err);
    return res.status(500).json({
      message: "Internal server error",
      details: err.message || err,
    });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
