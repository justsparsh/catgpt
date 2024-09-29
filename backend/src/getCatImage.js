import dotenv from "dotenv";

dotenv.config();

const getCatImage = async () => {
    try {
      const response = await fetch('https://api.thecatapi.com/v1/images/search', {
        method: 'GET',
        headers: {
          'x-api-key': process.env.CAT_API_KEY,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
    //   console.log(data);
      return data[0].url;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  
export default getCatImage;