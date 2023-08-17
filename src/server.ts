import express from "express";
import axios from "axios";

interface FoodData {
  name: string;
  weight: number;
}

interface FoodList {
  foods: FoodData[];
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.post("/foods", (req, res) => {
  try {
    const { foods }: FoodList = req.body;
    console.log(foods);
    const APP_KEY = "6ecdb6d985295b54159f273193469b66";

    const foodPromises = foods.map((food) =>
      axios.post(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        {
          query: `${food.weight}g ${food.name}`,
        },
        {
          headers: {
            "x-app-id": "f530c964",
            "x-app-key": APP_KEY,
            "Content-Type": "application/json",
          },
        }
      )
    );

    Promise.all(foodPromises)
      .then((responses) => {
        const results = responses.map((response, index) => {
          const foodInfo = response.data.foods[0];
          const calories = foodInfo.nf_calories;
          const totalCaloriesForFood = (calories * foods[index].weight) / 100;

          return {
            foodName: foodInfo.food_name,
            caloriesPer100g: calories,
            totalCaloriesForFood: totalCaloriesForFood,
          };
        });

        const totalCalories = results.reduce(
          (sum, food) => sum + food.totalCaloriesForFood,
          0
        );

        res.json({ foods: results, totalCalories });
      })
      .catch((error) => {
        console.error("Server error:", error);
        res.status(500).json({ err: "Something went wrong2" });
      });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ err: "Something went wrong1" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
