const mongoose = require('mongoose');
require('dotenv').config();
const { User, Recipe, Blog } = require('./models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/project_x_db';

const recipes = [
    {
        title: "Honey Garlic Chicken Thighs",
        category: "Non-Veg",
        calories: 420,
        imageURL: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1000",
        ingredients: [
            { name: "Chicken thighs", qty: 500, unit: "g" },
            { name: "Garlic cloves", qty: 4, unit: "pcs" },
            { name: "Honey", qty: 3, unit: "tbsp" },
            { name: "Soy sauce", qty: 2, unit: "tbsp" }
        ],
        steps: [
            "Start by patting the chicken thighs completely dry with a paper towel and season them generously on both sides with salt and freshly ground black pepper.",
            "Heat a large skillet over medium-high heat with a splash of olive oil. Carefully place the chicken skin-side down and sear for 5-7 minutes until the skin is beautifully golden and crispy.",
            "While the chicken is rendering, whisk together the honey, soy sauce, and a slight splash of apple cider vinegar in a small mixing bowl.",
            "Flip the chicken thighs and cook for an additional 4-5 minutes until the internal temperature reaches a safe level.",
            "Add the minced garlic to the skillet and let it sizzle in the pan juices for 30 seconds until deeply fragrant.",
            "Pour the prepared honey-soy mixture over the chicken, lowering the heat to medium. Let the sauce bubble and magically thicken into a sticky, glossy glaze for the last 2 minutes.",
            "Spoon the hot, sticky sauce repeatedly over the chicken thighs to ensure every bite is perfectly coated. Serve immediately."
        ],
        isPremium: false,
        averageRating: 4.8,
        totalRatings: 12
    },
    {
        title: "15-Minute Garlic Butter Pasta",
        category: "Veg",
        calories: 350,
        imageURL: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000",
        ingredients: [
            { name: "Spaghetti", qty: 200, unit: "g" },
            { name: "Butter", qty: 50, unit: "g" },
            { name: "Garlic", qty: 3, unit: "cloves" },
            { name: "Parmesan", qty: 30, unit: "g" }
        ],
        steps: [
            "Bring a large pot of generously salted water to a rolling boil. Add your spaghetti and cook according to the package directions until it reaches a perfect al dente texture.",
            "While the pasta is bubbling away, melt a generous knob of butter in a wide skillet over medium heat.",
            "Add finely minced garlic to the melted butter and let it cook slowly for 1-2 minutes. Be careful not to burn the garlic; it should just turn a light golden color and become very fragrant.",
            "Just before the pasta is done, safely scoop out about half a cup of the starchy pasta cooking water and keep it aside.",
            "Drain the pasta and toss it directly into the skillet with the garlic butter. Squeeze in some fresh lemon juice and add the reserved pasta water.",
            "Sprinkle a big handful of grated parmesan over the top. Toss everything vigorously in the pan until the butter, cheese, and pasta water emulsify into a light, silky sauce that elegantly coats every strand."
        ],
        isPremium: false,
        averageRating: 4.5,
        totalRatings: 25
    },
    {
        title: "Sheet-Pan Veggie Fajitas",
        category: "Vegan",
        calories: 280,
        imageURL: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000",
        ingredients: [
            { name: "Bell peppers", qty: 3, unit: "pcs" },
            { name: "Red onion", qty: 1, unit: "pc" },
            { name: "Black beans", qty: 200, unit: "g" }
        ],
        steps: [
            "Preheat your oven to 400°F (200°C) and prepare a large, rimmed baking sheet.",
            "Slice the bell peppers and red onions into long, even, and thin fajita-style strips and scatter them evenly across the pan.",
            "Rinse and drain the black beans thoroughly, then add them to the baking sheet for a powerful hit of plant-based protein.",
            "Drizzle the entire pan with a good quality olive oil, and aggressively sprinkle with cumin, chili powder, sea salt, and black pepper.",
            "Use your hands to toss the vegetables and beans until they are completely and evenly coated in the oil and spices. Spread them out into a single layer on the pan to ensure they roast and char, rather than steam.",
            "Roast in the hot oven for 15-20 minutes, checking occasionally, until the peppers are tender-crisp and beginning to char at the very edges.",
            "Serve sizzling hot straight from the pan, spooned into warm tortillas, and generously topped with slices of ripe, creamy avocado."
        ],
        isPremium: false,
        averageRating: 4.2,
        totalRatings: 8
    },
    {
        title: "Lemon Herb Roasted Chicken",
        category: "Non-Veg",
        calories: 380,
        isPremium: true,
        imageURL: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=1000",
        ingredients: [
            { name: "Chicken breast", qty: 2, unit: "pcs" }, 
            { name: "Lemon", qty: 1, unit: "pc" }
        ],
        steps: [
            "Preheat the oven to a strong 400°F (200°C) to ensure a good roast.",
            "Thoroughly dry the chicken breasts using a kitchen towel. This is crucial for achieving a nice, caramelized exterior.",
            "In a small mixing bowl, create a fragrant rub by combining olive oil, freshly minced garlic, chopped fresh rosemary, salt, and coarse pepper.",
            "Vigorously rub the herb and oil mixture all over the chicken breasts, making sure every surface is covered.",
            "Place the marinated chicken breasts into a sturdy baking dish and defensively surround them with thick, juicy slices of fresh lemon.",
            "Roast undisturbed in the oven for roughly 25-30 minutes. Pull them out when the chicken is fully cooked, juicy, and the surrounding lemon slices have begun to caramelize in the pan juices.",
            "Let the chicken rest for a 5 full minutes before slicing to retain maximum juiciness, then drizzle the caramelized pan sauces over the top."
        ]
    },
    {
        title: "Black Bean & Corn Salad",
        category: "Vegan",
        calories: 220,
        imageURL: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000",
        ingredients: [
            { name: "Black beans", qty: 400, unit: "g" }, 
            { name: "Corn", qty: 200, unit: "g" }
        ],
        steps: [
            "Drain and thoroughly rinse the canned black beans under cold water to remove excess sodium and starch.",
            "In a large serving bowl, combine the rinsed black beans, sweet corn kernels (thawed if using frozen), and finely diced red bell peppers.",
            "In a separate small jar, vigorously shake together fresh lime juice, a touch of extra virgin olive oil, a pinch of earthy cumin, salt, and finely ground black pepper to create a zesty vinaigrette.",
            "Pour the bright vinaigrette directly over the bean and corn mixture in the large bowl.",
            "Using a large spoon, toss the salad well to ensure every bean and corn kernel is coated in the dressing.",
            "Finish by tossing in a generous, leafy handful of freshly chopped cilantro. Let the salad chill in the fridge for 20 minutes before serving so the flavors can fully marry and pop."
        ]
    },
    {
        title: "Homemade Skillet Lasagna",
        category: "Non-Veg",
        calories: 520,
        isPremium: true,
        imageURL: "https://images.unsplash.com/photo-1619895092538-128341789043?q=80&w=1000",
        ingredients: [
            { name: "Ground beef", qty: 300, unit: "g" }, 
            { name: "Pasta sauce", qty: 400, unit: "ml" }
        ],
        steps: [
            "Place a large, deep skillet over medium-high heat. Add the ground beef, breaking it apart with a wooden spoon as it heavily browns and renders its fat.",
            "Once the beef is fully browned and crumbled, carefully drain any excess fat from the pan.",
            "Pour in your favorite high-quality jarred pasta sauce directly into the skillet with the beef.",
            "Take dry lasagna noodles and roughly break them into 2 or 3-inch chunky pieces. Submerge these broken pieces deep into the bubbling meat sauce.",
            "Add half a cup of water, cover the skillet tightly with a lid, and let it simmer on medium-low for 15-20 minutes, or until the pasta is perfectly tender and has absorbed some of the sauce.",
            "Remove the lid, and drop generous spoonfuls of creamy ricotta cheese over the warm lasagna in distinct dollops.",
            "Sprinkle a thick, heavy layer of shredded mozzarella over the entire skillet. Cover with the lid for exactly 2 final minutes just until the mozzarella has melted into a glorious, stretchy top layer."
        ]
    },
    {
        title: "Butter Chicken (Murgh Makhani)",
        category: "Non-Veg",
        calories: 450,
        isPremium: true,
        imageURL: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1000",
        ingredients: [
            { name: "Chicken", qty: 500, unit: "g" }, 
            { name: "Heavy Cream", qty: 100, unit: "ml" }
        ],
        steps: [
            "Begin by cutting the chicken into bite-sized chunks.",
            "Marinate the chicken pieces in a rich mixture of plain yogurt, minced garlic, grated ginger, garam masala, turmeric, and chili powder. Cover and let it rest in the fridge for at least 1 hour (or overnight for maximum flavor).",
            "In a heavy-bottomed pot, sear the marinated chicken pieces over high heat until slightly charred. Remove and set aside.",
            "In the same pot, sauté diced onions, remaining garlic, and ginger until soft. Pour in pureed tomatoes and let the mixture gently simmer down into a thick paste.",
            "Stir in cold butter and let it melt into the rich tomato paste, creating the foundational flavors of the makhani sauce.",
            "Return the charred chicken to the pot. Stir well to coat the chicken, lowering the heat.",
            "Finally, pour in the heavy cream and a sprinkle of dried fenugreek leaves. Simmer for 10 minutes until the sauce is velvety smooth and the chicken is incredibly tender."
        ]
    },
    {
        title: "Quinoa Buddha Bowl",
        category: "Vegan",
        calories: 310,
        imageURL: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
        ingredients: [
            { name: "Quinoa", qty: 1, unit: "cup" }, 
            { name: "Sweet Potato", qty: 1, unit: "pc" }
        ],
        steps: [
            "Rinse the quinoa thoroughly under cold water to remove its natural bitterness. Cook the quinoa in two cups of water or vegetable broth until tender and the water is fully absorbed. Fluff with a fork.",
            "Preheat your oven to 400°F (200°C). Peel and chop the sweet potato into small, uniform cubes.",
            "Toss the sweet potato cubes with olive oil, paprika, salt, and pepper. Roast on a baking sheet for 20-25 minutes until tender and slightly crisp on the edges.",
            "While the potatoes are roasting, prepare the dressing by whisking together tahini, lemon juice, a splash of water, and minced garlic until smooth and pourable.",
            "Assemble the bowl by laying down a hearty base of the cooked fluffy quinoa.",
            "Arrange the roasted sweet potatoes, a handful of fresh spinach, and any other vibrant vegetables you like in distinct, colorful sections over the quinoa.",
            "Generously drizzle the creamy tahini dressing over the entire bowl right before eating."
        ]
    },
    {
        title: "Paleo Avocado Salmon",
        category: "Non-Veg",
        calories: 480,
        isPremium: true,
        imageURL: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=1000",
        ingredients: [
            { name: "Salmon Fillet", qty: 200, unit: "g" }, 
            { name: "Avocado", qty: 1, unit: "pc" }
        ],
        steps: [
            "Pat the salmon fillet incredibly dry with a paper towel. Season the flesh side evenly with salt, pepper, and a dash of smoked paprika.",
            "Heat a non-stick skillet over medium-high heat with a touch of coconut or olive oil. Wait until the pan is very hot.",
            "Place the salmon skin-side up (flesh-side down) in the skillet and let it sear completely undisturbed for exactly 4 minutes to develop a beautiful crust.",
            "Carefully flip the salmon and cook the skin side for another 3-4 minutes until the skin goes crispy and the fish flakes easily with a fork.",
            "While the salmon is searing, open an avocado and scoop its flesh into a small bowl. Coarsely mash it with fresh lime juice, finely chopped red onion, and chopped cilantro.",
            "Remove the salmon from the heat and place it on a serving plate.",
            "Immediately top the hot, freshly cooked salmon fillet with a generous mound of the cool, zesty mashed avocado salsa, allowing the flavors and temperatures to contrast."
        ]
    },
    {
        title: "Gourmet Mushroom Risotto",
        category: "Veg",
        calories: 390,
        isPremium: true,
        imageURL: "https://images.unsplash.com/photo-1633337474564-1d9e26466367?q=80&w=1000",
        ingredients: [
            { name: "Arborio Rice", qty: 1, unit: "cup" }, 
            { name: "Mushrooms", qty: 250, unit: "g" }
        ],
        steps: [
            "In a medium saucepan, bring vegetable or chicken broth to a very gentle simmer. Keep it warm on a back burner.",
            "In a large, heavy-bottomed skillet, heat olive oil and butter over medium heat. Add thinly sliced mushrooms and sauté until deeply browned and their moisture has evaporated. Remove the mushrooms and set aside.",
            "In the same heavy skillet, add a bit more oil and sauté finely diced shallots until soft and translucent.",
            "Add the Arborio rice to the shallots and stir continuously for 2 minutes, allowing the rice to toast and become slightly translucent around the edges.",
            "Deglaze the pan with a splash of dry white wine (optional but recommended), stirring aggressively until the liquid is fully absorbed by the rice.",
            "Begin the cooking process by ladling in the warm broth one cup at a time. Stir frequently and vigorously, only adding the next ladle of broth once the previous one has been almost entirely absorbed.",
            "After 18-20 minutes, when the rice is creamy but still has a slight bite (al dente), remove from heat. Stir in the sautéed mushrooms, a handful of freshly grated Parmesan, and a final knob of butter for a luxurious finish."
        ]
    },
    {
        title: "Spicy Tofu Stir-Fry",
        category: "Vegan",
        calories: 260,
        imageURL: "https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=1000",
        ingredients: [
            { name: "Firm Tofu", qty: 300, unit: "g" }, 
            { name: "Broccoli", qty: 1, unit: "head" }
        ],
        steps: [
            "Start by pressing the extra-firm tofu for at least 15 minutes to remove excess water. This is essential for getting crispy tofu.",
            "Cut the pressed tofu into bite-sized cubes. For an ultra-crispy edge, toss the cubes lightly in cornstarch.",
            "Heat sesame oil in a wok or large skillet over high heat. Add the tofu cubes in a single layer and pan-fry undisturbed until deeply golden brown on the bottom. Flip and repeat for all sides, then remove tofu from the pan.",
            "In the same blazing hot wok, add the broccoli florets and a tiny splash of water. Toss them quickly to steam and slightly char.",
            "In a small bowl, aggressively whisk together soy sauce, sriracha or chili paste, minced garlic, grated ginger, and a pinch of sugar to create the spicy stir-fry sauce.",
            "Return the crispy tofu to the wok alongside the broccoli.",
            "Pour the fiery, savory sauce directly over the tofu and broccoli, tossing everything vigorously for 1-2 minutes until the sauce heavily coats the ingredients and thickens up."
        ]
    },
    {
        title: "Keto Steak & Asparagus",
        category: "Non-Veg",
        calories: 550,
        isPremium: true,
        imageURL: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1000",
        ingredients: [
            { name: "Sirloin Steak", qty: 250, unit: "g" }, 
            { name: "Asparagus", qty: 1, unit: "bunch" }
        ],
        steps: [
            "Take the sirloin steak out of the fridge exactly 30 minutes before cooking to allow it to come to room temperature. Season it very aggressively on all sides with coarse sea salt and cracked black pepper.",
            "Heat a cast-iron skillet over high heat until it's smoking hot. Add a high-heat cooking oil.",
            "Carefully lay the steak into the dry, hot pan. Cook undisturbed for 3-4 minutes to develop a thick, dark crust.",
            "Flip the steak and cook for another 3-4 minutes. During the last minute, drop in two large tablespoons of butter, smashed garlic cloves, and a sprig of fresh thyme.",
            "Tilt the pan and continuously baste the top of the steak with the foaming, aromatic butter.",
            "Remove the steak to a cutting board to rest. In the same unwashed pan, utilizing the leftover steak fat and butter, toss in the trimmed asparagus spears.",
            "Sauté the asparagus vigorously for 4-5 minutes until bright green and slightly blistered, then serve immediately alongside the nicely rested, sliced steak."
        ]
    },
    {
        title: "Authentic Veggie Paella",
        category: "Veg",
        calories: 340,
        imageURL: "https://images.unsplash.com/photo-1534080564617-307ff2df824b?q=80&w=1000",
        ingredients: [
            { name: "Paella Rice", qty: 200, unit: "g" }, 
            { name: "Saffron", qty: 1, unit: "pinch" }
        ],
        steps: [
            "Heat vegetable or chicken broth in a saucepan. Crumble a generous pinch of high-quality saffron threads into the hot broth and let it steep, turning the liquid a brilliant gold.",
            "In a wide, shallow paella pan or very large skillet, heat olive oil over medium-high heat. Sauté diced onions, red bell peppers, and garlic until softened.",
            "Stir in chopped tomatoes and a teaspoon of sweet smoked paprika, cooking until the tomatoes break down into a thick base.",
            "Add the short-grain paella rice (Bomba or Arborio), stirring it through the vegetable mix for 2 minutes to toast the grains.",
            "Carefully pour the hot, saffron-infused broth into the pan. Give it one final, gentle stir to distribute the rice evenly across the bottom of the pan.",
            "From this point on, absolutely do not stir the rice. Lower the heat to a steady simmer and let it cook uncovered for 15-20 minutes.",
            "In the last 5 minutes, scatter artichoke hearts and green peas over the top. Once the liquid is absorbed, turn up the heat for 60 seconds to create the 'socarrat' (the prized crispy crust on the bottom). Remove from heat and cover with a towel to rest for 5 minutes before serving."
        ]
    },
    {
        title: "Chocolate Lava Cake",
        category: "Sweet",
        calories: 450,
        isPremium: true,
        imageURL: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=1000",
        ingredients: [
            { name: "Dark Chocolate", qty: 100, unit: "g" }, 
            { name: "Butter", qty: 50, unit: "g" }
        ],
        steps: [
            "Preheat your oven to a blazing 425°F (220°C). Generously butter two ramekins and dust the insides heavily with cocoa powder to prevent any sticking.",
            "In a microwave-safe bowl, combine high-quality dark chocolate pieces and unsalted butter. Microwave in 30-second bursts, stirring in between, until melted and completely smooth.",
            "In a separate mixing bowl, aggressively whisk together powdered sugar, two whole large eggs, and a splash of vanilla extract until the mixture is pale and slightly frothy.",
            "Vigorously whisk the warm melted chocolate mixture into the egg and sugar mixture until deeply combined and glossy.",
            "Gently fold in just two tablespoons of all-purpose flour until there are no visible dry streaks.",
            "Carefully divide the batter evenly between the prepared ramekins. Place the ramekins on a baking sheet to make them easier to handle.",
            "Bake in the preheated oven for exactly 10 minutes. The edges should be set and pulling away from the sides, but the center should look very soft and slightly jiggly. Let rest for 1 minute, then invert cautiously onto a plate and dust with powdered sugar."
        ]
    },
    {
        title: "Berry Bliss Smoothie Bowl",
        category: "Veg",
        calories: 240,
        imageURL: "https://images.unsplash.com/photo-1526424382096-74a93e105682?q=80&w=1000",
        ingredients: [
            { name: "Frozen Berries", qty: 200, unit: "g" }, 
            { name: "Banana", qty: 1, unit: "pc" }
        ],
        steps: [
            "Gather your ingredients. For the thickest, creamiest texture, it is absolutely essential to use only heavily frozen berries and a frozen banana.",
            "Add the frozen mixed berries, broken-up frozen banana, and a very tiny splash of your preferred milk (almond, oat, or dairy) to a high-speed blender.",
            "Begin blending on the lowest setting. Use the blender's tamper tool to push the frozen fruit down into the blades as it starts to churn.",
            "Gradually increase the speed, blending until the mixture is completely smooth and resembles the thick texture of soft-serve ice cream. Do not over-blend or it will melt.",
            "Immediately scoop the thick, frosty smoothie into a chilled serving bowl.",
            "Working quickly before it melts, neatly line the top of the bowl with artistic rows of crunchy granola, sliced fresh fruit, chia seeds, and a generous drizzle of peanut butter.",
            "Serve right away with a spoon, enjoying the contrast between the cold, creamy smoothie and the crunchy toppings."
        ]
    },
    {
        title: "Traditional Gulab Jamun",
        category: "Sweet",
        calories: 320,
        imageURL: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000",
        ingredients: [
            { name: "Khoya (Milk solids)", qty: 200, unit: "g" },
            { name: "All-purpose flour", qty: 2, unit: "tbsp" },
            { name: "Sugar", qty: 1, unit: "cup" },
            { name: "Cardamom", qty: 3, unit: "pods" },
            { name: "Rose water", qty: 1, unit: "tsp" }
        ],
        steps: [
            "Begin by preparing the fragrant sugar syrup. Combine one cup of sugar with an equal amount of water in a saucepan over medium heat.",
            "Once the sugar dissolves, add slightly crushed cardamom pods and simmer for 5 minutes until the syrup feels slightly tacky between your fingers. Turn off the heat and stir in the rose water.",
            "On a wide plate, grate or crumble the khoya to ensure there are absolutely no lumps.",
            "Add a little all-purpose flour and a tiny pinch of baking soda. Very gently mix and knead everything together into a soft, smooth dough without applying too much physical pressure.",
            "Pinch off tiny pieces of the dough and roll them gently between your palms to form perfect, seamless little balls. A single crack in the ball could cause it to break apart while frying.",
            "Heat ghee or oil in a deep pan over medium-low heat. The oil must be warm, not hot. Gently drop the balls into the oil and continuously agitate the oil so the balls colour evenly all over.",
            "Once they achieve a gorgeous, deep golden brown exterior, remove them using a slotted spoon and immediately plunge them directly into the warm aromatic sugar syrup. Let them soak for at least 2 hours to become incredibly soft and swollen."
        ],
        isPremium: false,
        averageRating: 4.9,
        totalRatings: 45
    },
    {
        title: "Tandoori Paneer Tikka",
        category: "Veg",
        calories: 280,
        imageURL: "https://images.unsplash.com/photo-1599487405255-fc42f4c6e3b0?q=80&w=1000",
        ingredients: [
            { name: "Paneer cubes", qty: 300, unit: "g" },
            { name: "Greek yogurt", qty: 100, unit: "g" },
            { name: "Bell peppers", qty: 1, unit: "large" },
            { name: "Tandoori Masala", qty: 2, unit: "tbsp" }
        ],
        steps: [
            "In a large stainless steel bowl, create a thick marinade by vigorously whisking together thick Greek yogurt, bold tandoori masala, a splash of lemon juice, minced ginger, garlic paste, and a tablespoon of mustard oil for authentic flavor.",
            "Cut the paneer, bell peppers, and a large red onion into uniform, large square cubes.",
            "Toss the paneer and vegetables perfectly into the fiercely red marinade, using your hands to ensure every single piece is heavily coated.",
            "Cover the bowl securely and leave it to marinate in the refrigerator for an absolute minimum of 1 hour to let the flavors deeply penetrate.",
            "If using wooden skewers, soak them in water for 20 minutes first. Carefully thread the paneer and vegetables onto the skewers in an alternating fashion.",
            "Heat a grill pan over high heat, or preheat your oven’s broiler. Place the loaded skewers on the heat source.",
            "Grill, rotating every few minutes, until the paneer is completely cooked through inside, and the edges of the vegetables and cheese have beautiful, dark charred spots. Serve instantly with mint yogurt chutney."
        ],
        isPremium: true,
        averageRating: 4.7,
        totalRatings: 32
    },
    {
        title: "Premium Sushi Platter",
        category: "Non-Veg",
        calories: 380,
        imageURL: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000",
        ingredients: [
            { name: "Sushi grade Salmon", qty: 200, unit: "g" },
            { name: "Sushi rice", qty: 300, unit: "g" },
            { name: "Nori sheets", qty: 4, unit: "pcs" },
            { name: "Wasabi", qty: 1, unit: "tbsp" }
        ],
        steps: [
            "Rinse the short-grain sushi rice until the water runs completely clear. Cook the rice, then gently fold in a mixture of rice vinegar, sugar, and salt while fanning it rapidly to speed up the cooling process and give the grains a glossy sheen.",
            "Using an incredibly sharp knife, elegantly slice the high-quality sushi-grade raw salmon into perfectly uniform, long, clean strips without sawing at the delicate flesh.",
            "Lay a full sheet of roasted nori seaweed flat on a bamboo sushi rolling mat with the rough, textured side facing upwards.",
            "Slightly wet your hands to prevent sticking, and grab a handful of the seasoned rice. Gently and evenly spread the rice across the nori, being absolutely careful to leave a 1-inch border fully bare at the top edge.",
            "Place a neat line of the fresh salmon strips elegantly across the center of the spread rice. For extra flavor, add incredibly thin slices of creamy avocado alongside the salmon.",
            "Using the bamboo mat to guide you, lift the edge of the nori closest to you and carefully, tightly roll it fully over the filling, continuing until you reach the bare edge at the very top.",
            "Wet a very sharp knife to make perfect, clean slices. Cut the long roll into neat, bite-sized cylindrical pieces. Serve arranged beautifully on a platter with soy sauce, pickled ginger, and a dab of strong wasabi."
        ],
        isPremium: true,
        averageRating: 5.0,
        totalRatings: 18
    },
    {
        title: "Rainbow Vegan Salad Bowl",
        category: "Vegan",
        calories: 310,
        imageURL: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000",
        ingredients: [
            { name: "Kale and spinach mix", qty: 100, unit: "g" },
            { name: "Roasted chickpeas", qty: 50, unit: "g" },
            { name: "Quinoa", qty: 50, unit: "g" },
            { name: "Tahini dressing", qty: 2, unit: "tbsp" }
        ],
        steps: [
            "Start by thoroughly washing and de-stemming the kale. Tear the kale into bite-sized pieces into a large bowl.",
            "Add a tiny splash of olive oil to the raw kale leaves and physically massage them with your hands for two minutes until they dramatically soften and darken in color.",
            "In your main serving bowl, create a large bed composed of the heavily massaged kale and handfuls of fresh spinach.",
            "Artistically arrange your toppings over the greens, creating distinct colorful sections: a mound of fluffy cooked quinoa, a handful of crispy oven-roasted chickpeas, and loads of fresh, vibrantly sliced crunchy vegetables.",
            "In a small mixing jar, whisk together high-quality creamy tahini, lemon juice, just a splash of maple syrup to balance the bitterness, water to thin it, salt, and pepper.",
            "When ready to eat, pour the rich dressing luxuriously all over the top of the bowl.",
            "Finish by sprinkling heavily with an assortment of raw nuts and toasted sunflower seeds for maximum textural contrast. Toss aggressively and enjoy."
        ],
        isPremium: false,
        averageRating: 4.6,
        totalRatings: 24
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        const force = process.argv.includes('--force');

        if (force) {
            console.log('Force flag detected. Clearing existing data...');
            await User.deleteMany({});
            await Recipe.deleteMany({});
            await Blog.deleteMany({});
        } else {
            const recipeCount = await Recipe.countDocuments();
            if (recipeCount > 10) {
                console.log('Database already has data. Skipping seed. (Use --force to reset)');
                process.exit();
            }
        }

        await Recipe.insertMany(recipes);

        // Add a default admin if not existing
        const adminExists = await User.findOne({ email: "admin@smartmeal.com" });
        if (!adminExists) {
            await User.create({
                email: "admin@smartmeal.com",
                name: "Admin User",
                authProvider: "email",
                subscriptionLevel: "Pro",
                password: "admin123"
            });
        }

        await Blog.create({
            authorName: "NutriBot",
            title: "The Science of Balanced Meals",
            bodyContent: "Consistency is key to a healthy lifestyle...",
            tags: ["Health", "Science"]
        });

        console.log('✅ Seeding complete! Database enriched.');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
}
seedDatabase();
