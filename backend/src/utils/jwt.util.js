const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GG_CLIENT_ID);

const generateAccessToken = (payload) => {
  return jwt.sign(
    { id: payload._id || payload.id, role: payload.role, email: payload.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );
};

const generateRefreshToken = (payload) => {
  return jwt.sign(
    { id: payload._id || payload.id, role: payload.role, email: payload.email },
    process.env.JWT_SECRET,
    { expiresIn: "30d", algorithm: "HS256" }
  );
};

const verifyToken = async (token) => {
  try {
    return await jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyTokenGoogle = async (token) => {
  const clientId = process.env.GG_CLIENT_ID.trim();
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: clientId,
  });
  return ticket.getPayload();
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyTokenGoogle,
};
