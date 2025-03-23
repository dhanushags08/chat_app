import jwt from "jsonwebtoken";

export const generate_token = (uder_id, res) => {
  const token = jwt.sign({ uder_id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, //in mseconds
    secure: process.env.NODE_ENV !== "development",
  });
};
