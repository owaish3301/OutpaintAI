import dotenv from 'dotenv';
dotenv.config();

import { Client } from "@gradio/client";
import express from 'express'
import cors from 'cors';

const port = process.env.PORT;
const app = express();
let client;

(async () => {
  try {
    client = await Client.connect("fffiloni/diffusers-image-outpaint", { hf_token: process.env.HF_TOKEN });
    console.log('Gradio client connected');
  } catch (error) {
    console.error("Failed to connect to Gradio client:", error);
  }
})();

app.use(express.json());
app.use(cors({
  origin: true // Allow only your frontend's origin
}));

async function handle_generate(req, res) {
  try {
    const { imageUrl, height, width, overlap_percentage, prompt_input } = req.body;
	  console.log(imageUrl)
    const response = await fetch(imageUrl);
    const image = await response.blob();
    console.log(height, width, overlap_percentage, prompt_input)
    const result = await client.predict("/infer", { 
      image: image, 		
      width: width, 		
      height: height, 		
      overlap_percentage: overlap_percentage, 		
      num_inference_steps: 8, 		
      resize_option: "Full", 		
      custom_resize_percentage: 1, 		
      prompt_input: prompt_input, 		
      alignment: "Middle", 		
      overlap_left: true, 		
      overlap_right: true, 		
      overlap_top: true, 		
      overlap_bottom: true, 
  });
    console.log(result.data)
    res.json({ result: result.data[0][1].url }); // Send actual data back

  } catch (error) {
    console.error("Error in handle_generate:", error);
    res.status(500).json({ message: "error occurred", error: error.message });
  }
}

app.post('/generate', handle_generate);

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: "Global error occurred", error: err.message });
});

app.listen(port || 80, () => {
  console.log('Server running on port', port );
});
