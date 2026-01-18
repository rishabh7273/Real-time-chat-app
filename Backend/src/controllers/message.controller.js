import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import { User } from "../models/User.js"
import { getReceiverSocketId, io } from "../lib/socket.js";


export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password')

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getAllContacts:", error);
        res.status(500).json({ message: "server error" });
    }
};

export const getMessageByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })
        res.json(messages)
    } catch (error) {
        console.log("Error in getMessage Controller", error.message);
        res.status(500).json({ message: "internal server error" });
    }
}

export const sendMessage = async (req, res) => {

    try {
        const { image, text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ message: "Text or image is required." });
        }
        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "Cannot send messages to yourself." });
        }
        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found." });
        }

        let imageUrl;

        if (image) {
            //upload image to claudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });
        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json(newMessage);
    } catch (error) {
        console.log("Error in send message controller", error.message);
        res.status(500).json({ error: "internal server error" })
    }

}

export const getChatpartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // find all message where the logged-in user is either me or receiver

        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId }
            ]
        });
        const chatPartnerIds = [...new Set(
            messages.map((msg) => msg.senderId.toString() === loggedInUserId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString()
            )
        ),
        ];
        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password")
        res.json(chatPartners)

    } catch (error) {
        console.log("Error in chatPartners", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}