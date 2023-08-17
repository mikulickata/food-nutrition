"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
app.post("/foods", (req, res) => {
    try {
        const { foods } = req.body;
        console.log(foods);
        const APP_KEY = "6ecdb6d985295b54159f273193469b66";
        const foodPromises = foods.map((food) => axios_1.default.post("https://trackapi.nutritionix.com/v2/natural/nutrients", {
            query: `${food.weight}g ${food.name}`,
        }, {
            headers: {
                "x-app-id": "f530c964",
                "x-app-key": APP_KEY,
                "Content-Type": "application/json",
            },
        }));
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
            const totalCalories = results.reduce((sum, food) => sum + food.totalCaloriesForFood, 0);
            res.json({ foods: results, totalCalories });
        })
            .catch((error) => {
            console.error("Server error:", error);
            res.status(500).json({ err: "Something went wrong2" });
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ err: "Something went wrong1" });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
