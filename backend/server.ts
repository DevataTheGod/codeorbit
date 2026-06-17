import "dotenv/config";
import express from "express";
import cors from "cors";
import otpRouter from "./routes/googleAuthOTP";

const app = express();

const port = Number(process.env.PORT || 8787);
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:8080";

app.use(
  cors({
    origin: frontendOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "otp-server" });
});

app.use("/", otpRouter);

app.listen(port, () => {
  console.log(`[otp-server] running on http://localhost:${port}`);
  console.log(`[otp-server] allowed origin: ${frontendOrigin}`);
});
