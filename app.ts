import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./src/config/env";
import { errorMiddleware } from "./src/middlewares/error.middleware";
import authRoutes from "./src/modules/auth/auth.routes";
import userRoutes from "./src/modules/user/user.routes";
import accountInviteRoutes from "./src/modules/account/accountInvite.routes";


export const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true
}));

app.use(helmet());
app.use(express.json());

app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "Working Fine" });
});




app.use(errorMiddleware); 
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use(helmet());

app.use("api/accounts", accountInviteRoutes);

