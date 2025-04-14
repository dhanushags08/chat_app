import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const get_users_for_sidebar = async (req, res) => {
  try {
    const logged_in_user_id = req.user._id;
    const filtered_users = await User.find({
      _id: { $ne: logged_in_user_id },
    }).select("-password");

    res.status(200).json(filtered_users);
  } catch (error) {
    console.log("Error in get_users_for_sidebar", error.message);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

export const get_messages = async (req, res) => {
  try {
    const { id: user_to_chat_id } = req.params.id;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: user_to_chat_id },
        { senderId: user_to_chat_id, receiverId: senderId },
      ],
    });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.log("Error in get_messages", error.message);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

export const send_message = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const upload_response = await cloudinary.uploader.upload(image);
      imageUrl = upload_response.secureUrl;
    }

    const new_message = await Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await new_message.save();

    //

    res.status(201).json(new_message);
  } catch (error) {
    console.log("Error in send_message", error.message);
    res.status(500).json({
      message: "internal server error",
    });
  }
};
