import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3001', 
  methods: ['GET', 'POST'],       
}));
app.use(express.json());
app.use('/chat', chatRoutes);
app.use('/message', messageRoutes);

app.get('/', (req, res) => {
  res.send('Server is up and running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});