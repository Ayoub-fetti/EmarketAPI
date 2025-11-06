import jwt from "jsonwebtoken";


// Check if the user is logged in
export const isAuthenticated = (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("JWT_SECRET:", JWT_SECRET ? "exists" : "missing");
    console.log("Token:", token.substring(0, 20) + "...");
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Check if the logged-in user is an admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied: admin only", role: req.user.role });
  }

  next();
};
