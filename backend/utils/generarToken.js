import jwt from "jsonwebtoken";

const generarToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generarToken;
