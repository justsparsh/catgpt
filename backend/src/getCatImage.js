import dotenv from "dotenv";
import breedMap from "../data/catBreedShort.js";

dotenv.config();

const getCatImage = async (breed) => {
    let endpoint = null;
    let breedId = null;

    const breedLower = breed.toLowerCase();
    console.log(breedLower);
    if (breedLower === "any" || !breedMap.has(breedLower)) {
      endpoint = "https://api.thecatapi.com/v1/images/search";
    } else {
      breedId = breedMap.get(breedLower);
      endpoint = `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}`;
    }

    try {
      const response = await fetch(endpoint, {
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
      return data[0].url;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  
export default getCatImage;