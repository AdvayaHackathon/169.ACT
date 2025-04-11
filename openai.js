const OpenAI = require("openai");

// OpenAI Config
const openai = new OpenAI({
    apiKey: '',
});

async function openAI(userData) {
    const chatCompletion = await openai.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: `You are an AI travel itinerary and city experience assistant. I am a ${userData.age} year old ${userData.gender} currently in ${userData.city}, and I want to explore " ${userData.lookingFor}". Based on my age, gender, and location, recommend the most suitable, engaging, and relevant places to visit and things to do. 
                Understand who I am to infer what kind of places or experiences would be enjoyable, appropriate, and safe for me — whether cultural, historical, adventurous, social, relaxing, or recreational.
                Return the output in a minified JSON array with this format: [{"place_name_here": "place_description"}]`
            },
        ],
        model: 'gpt-3.5-turbo',
    })


    console.log(chatCompletion); // output
    console.log(chatCompletion.choices[0].message);
    let output = JSON.parse(chatCompletion.choices[0].message.content);
    return output;
}

module.exports = { openAI }
