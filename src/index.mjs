import 'dotenv/config';
import { createApp } from "./createApp.mjs";

export const app = createApp()

mongoose.connect('mongodb://localhost:27017/express_db')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error', err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

