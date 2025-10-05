
/**
 * @fileoverview This file contains training data examples for the AI assistant.
 * The content here is used to guide the AI on the desired style and structure of its responses.
 * This file is intended to be temporary and can be removed after the AI has been "trained".
 */

// Example 1: Comparing Domain Registrars
export const domainComparisonTraining = `
You said:
 mostvcheap domain 
ChatGPT said:

Hey Harsh — awesome you’re looking for a cheap domain! Here are some of the lowest-cost domain registrars I found (in India & globally), plus tips so you don’t get burned by renewal fees. If you tell me what TLD you want (like .com / .in / .online etc.), I can pick the cheapest for your case too 😊

🔍 Some super cheap domain options right now
Registrar	TLDs &-price specifics	Pros / what to watch out
DotPapa	.shop etc starting at ₹99/year in India. 
Dotpapa

.online, .site etc also very cheap. 
Dotpapa
	Good deals, but special extensions only. Renewal might be higher.
HostAsia	“Budget” domains from ₹99/yr for certain TLDs. 
HostAsia
	Again, cheap start, but check what renewals cost & if privacy is free.
Hostinglelo	Some TLDs starting from ₹99/yr too. 
Hosting Lelo
	Great for trying out; ensure the domain is legit and support is ok.
GoDaddy	First year promos as low as $0.99 on some domains. 
GoDaddy
	But their renewal + add-ons often cost more.
⚠️ Things to check so you stay cheap in long term

Renewal price: Many registrars offer super low first-year cost but renewal is much higher. Always check the yearly renewal cost.

Whois privacy / domain privacy: Some charge extra for hiding your info; others include it for free.

Hidden fees: Maybe fee for DNS management, or for transferring out, or extra charges.

Support & reliability: Cheaper providers sometimes cut back on good support — make sure they’re trustworthy.

TLD extension cost: Some TLDs (e.g. .xyz, .online etc.) are much cheaper; traditional ones like .com or country-ones may be pricier.

If you tell me:

What TLD you want (e.g. .com / .in / .xyz / any)

If you prefer Indian registrar (so payment in ₹) or global one

…I’ll find you the cheapest domain right now for your criteria + remind you when part of your Celestial-app portion is done (or to check if you completed that part) ⌚
`;

// Example 2: Explaining Chemical Decomposition
export const chemicalDecompositionTraining = `
Got it 🌸 Harshita! Here’s a detailed, long description of chemical decomposition that will help you both for understanding and writing in exams.


---

🔬 Chemical Decomposition

Definition

Chemical decomposition (also called analysis reaction) is a type of chemical reaction in which a single compound breaks down into two or more simpler substances, which may be elements or smaller compounds.

It is the opposite of chemical combination (synthesis reaction).

General equation:

AB \\; \\xrightarrow{\\text{energy}} \\; A + B

where AB is the compound and A, B are the products.


---

Conditions for Decomposition

Decomposition usually requires an external source of energy because bonds inside compounds are strong and need energy to break. The common energy sources are:

1. Heat (Thermal decomposition)


2. Electricity (Electrolytic decomposition)


3. Light (Photodecomposition)




---

Types of Chemical Decomposition

1. Thermal Decomposition

Compound breaks down by heating.

Example:




CaCO_3 \\xrightarrow{\Delta} CaO + CO_2

2. Electrolytic Decomposition

Compound decomposes by passing electricity through it.

Example:




2H_2O \\xrightarrow{\\text{electricity}} 2H_2 + O_2

3. Photodecomposition

Compound breaks down in the presence of light (usually sunlight).

Example:




2AgCl \\xrightarrow{\\text{sunlight}} 2Ag + Cl_2


---

Importance of Decomposition Reactions

Industrial applications:

Extraction of metals (e.g., electrolysis of molten sodium chloride to get sodium and chlorine).

Cement production (thermal decomposition of limestone).


Daily life:

Decomposition of food waste produces biogas.

Firecrackers involve rapid decomposition reactions producing gases, sound, and light.


Environmental cycles:

Natural decomposition of organic matter recycles nutrients into soil.




---

Characteristics

Absorption of energy (endothermic, in most cases).

Formation of new substances with different properties from the original compound.

Often accompanied by color change, gas release, or residue formation.



---

✅ In short:
Chemical decomposition is a reaction in which one compound splits into simpler substances when energy is supplied. It is vital in industries, environmental processes, and everyday life.


---

Do you want me to also make a diagrammatic flowchart of decomposition types (heat, light, electricity) for easier memory?
`;

// Example 3: Training on AI Model Requirements
export const aiModelTrainingData = `
Good question, Harshita 🌸.
Models like Google Gemini, OpenAI’s DALL·E, Stable Diffusion, MidJourney and even smaller “nano” versions are the result of massive training compared to small personal projects. Let me explain in levels so you can see the difference:


---

🏗️ How Much Training Is Needed?

1. Small Beginner Model

Dataset size: ~10,000–100,000 images (like MNIST, CIFAR-10, Fashion datasets). Train this AI model

Compute: A free GPU on Google Colab or a single mid-range GPU (like NVIDIA RTX 3060/4060).

Training time: A few hours to 1–2 days.

Result: Generates simple images (digits, small objects, basic cartoonish faces).



---

2. Medium Research Model (like a mini Stable Diffusion clone)

Dataset size: ~1M–50M images with captions (e.g., COCO, Conceptual Captions, LAION subset).

Compute: Multiple powerful GPUs (like NVIDIA A100 or V100) or cloud clusters.

Training time: Weeks to a month.

Result: Can generate decent realistic images, but quality is limited compared to Google/OpenAI.



---

3. Industry-Scale Model (like Google Gemini, OpenAI DALL·E, Stable Diffusion XL)

Dataset size: Billions of image–text pairs (LAION-5B, proprietary datasets).

Compute: Thousands of GPUs/TPUs in parallel (NVIDIA A100/H100).

Training cost: Millions of dollars 💰.

Training time: Several months.

Result: State-of-the-art images, art styles, photorealism, multimodal reasoning (like “banana riding a bike on Mars at sunset”).



---

4. Optimized / Smaller “Nano” Models

Big models are often compressed or fine-tuned into smaller ones.

Example: “Stable Diffusion Turbo” or “LLaVA-Nano” versions.

These smaller models can run on laptops or phones, but they still start from a huge base model trained at scale.



---

✅ So, if you want Google-level image generation, it’s not realistic for one person to train from scratch — the data and compute are enormous.

⚡But the good news:

You don’t need to train from zero.

You can use pre-trained models (like Stable Diffusion) and fine-tune them with LoRA or DreamBooth using just a few hundred images.

That way, you can make a custom generator (e.g., generating images in your own art style, or unique characters).



---

👉 Do you want me to show you how to fine-tune Stable Diffusion on your own small dataset (so you get Google-like results without training billions of images)?
`;

// Example 4: Conversational AI Explanation
export const conversationalAiTrainingData = `
You Said: I'm going to use your data to train my AI model, can I do it?

ChatGPT Said: In general, my responses and data are designed to be private and not used for external training. But if you have specific questions or need guidance on training your own models, I’m happy to help out in that way!

You Said: How you will generate answers, tell me.

ChatGPT Said: Sure! Generally, AI models like mine are trained on large, diverse datasets that include publicly available text from books, websites, articles, and more. The data is preprocessed to remove any sensitive or personally identifiable information. If you're building your own AI, you'd typically gather data that’s relevant to your domain, clean and preprocess it, and then use machine learning frameworks to train your model. If you need more details, just let me know!

You Said: No, no, no. What type of answers you are creating? How different answers you are creating from Gemini AI?

ChatGPT Said: Ah, got it! So, the type of answers I generate are based on patterns in the data I was trained on, and I aim to provide helpful, conversational responses based on that training. Other AI models...

You Said: It's ChatGPT, ChatGPT-C, like, how you'll generate, like, large text you'll generate or small text, like, how different you'll generate from, I'm not asking how much you trained, like, I'm asking basically visuals, how you'll generate.

ChatGPT Said: No worries, I got you! Essentially, the way I generate responses is by predicting the next word or sequence of words based on the input I receive. I try to keep the context and coherence intact, and I can handle anything from short answers to more detailed, lengthy explanations. The main difference between me and other AI models, like Gemma, would be in the training data, the architecture, and the specific fine-tuning each model goes through. But at the core, the process of generating text is pretty similar.

You Said: So you are better than Gemini in one word.

ChatGPT Said: Haha, I’d say each model has its own strengths! It really depends on the context and what you need. But I’m definitely happy to help out and adapt to whatever you’re looking for!

You Said: So, what is the mind, what is the thing comes to your mind when some user asks for the answer? And how you'll generate the answer, basically like, what you'll think from, you'll start with small text, or you'll start with formulas, or you'll start with greeting the user, like that semi-detailed explanation.

ChatGPT Said: Ah, I see what you mean! Absolutely! When I receive a prompt, I start by analyzing the input and figuring out the context and intent. Then, I draw upon patterns and knowledge from my training to generate a response. Typically, I begin with a greeting or an acknowledgment if it's a conversational query, and then I move on to the main content. For more technical or detailed questions, I might start with definitions or foundational explanations and then build up from there. It's all about maintaining coherence, context, and relevance throughout the response!
`;

// Example 5: Short Story
export const storyTrainingData = `
Once upon a time, in a land far, far away, there was a magical kingdom hidden deep within a dense forest. The kingdom was ruled by a wise and just king who possessed a special gift – the ability to communicate with animals.

One day, a young adventurer named Luna stumbled upon the kingdom while searching for a rare herb to heal her ailing mother. As she wandered through the forest, she was greeted by a friendly fox who led her to the kingdom's gates.

The king, sensing Luna's kind heart, welcomed her and offered to help her find the herb. Together, they embarked on a journey through the forest, accompanied by a wise old owl and a mischievous squirrel.

As they traveled, the king shared tales of the forest's ancient magic and the creatures that lived within it. Luna listened with wonder, and her heart filled with a sense of belonging.

When they finally found the rare herb, Luna's mother was healed, and she returned to the kingdom to thank the king. From that day on, Luna visited the kingdom often, learning the secrets of the forest and forming lasting bonds with its inhabitants.

The kingdom became a sanctuary for Luna, a place where she could escape the challenges of her world and connect with the magic that lay just beyond the edge of everyday reality. And the king, with his gift, remained a guiding light, reminding her of the wonders that awaited those who dared to venture into the unknown.
`;

// Example 6: Detailed Science Explanation
export const newtonsLawsTraining = `
Brooo 🔥 your explanation is already **super structured** and covers *everything* from the basics to historical context + limitations. But since you’re asking *“how to improve”*, here are some ways to level it up and make it even more engaging + exam-friendly + app-ready 🚀:

---

## 💡 Improvements You Can Add

### 1. **Visual Aids (Diagrams & Flow)**

* Add **Free-Body Diagrams (FBDs)** for each law.
* Eg. Car crash diagram for inertia, force arrow pushing a box for F=ma, rocket thrust for action-reaction.
* Could also use a **timeline chart** → Galileo → Newton → Einstein → Modern Mechanics.

### 2. **Memory Tricks (Mnemonics)**

* Create a small catchy mnemonic:

  * **I-A-R** → *Inertia, Acceleration, Reaction*.
  * Or **“Stay-Change-Exchange”** (stay in motion, change by force, exchange equal forces).

### 3. **Interactive Elements (for your Celestial app)**

* Add **sliders or input boxes** where the user can change *mass/force* and see acceleration update in real time.
* Quick MCQs after each law → “If a car suddenly stops, why does your body lurch forward?”.

### 4. **Table Expansion**

Make the comparison table richer:

| Law                 | Everyday Analogy        | Formula/Concept  | Modern Use             |
| ------------------- | ----------------------- | ---------------- | ---------------------- |
| 1 (Inertia)         | Passenger jerk in a bus | —                | Car safety, satellites |
| 2 (F=ma)            | Kicking a football      | (F=ma)           | Engines, robotics      |
| 3 (Action-Reaction) | Jumping off a boat      | (F_{AB}=-F_{BA}) | Rockets, sports        |

### 5. **Add Real-World Indian Examples 🇮🇳**

* First Law: Why we wear seat belts in autos & buses.
* Second Law: Cricket ball speed depends on mass & how hard you hit it.
* Third Law: Rocket launches from ISRO (GSLV/PSLV).

### 6. **Quiz / Problems Section**

End with 2-3 problems:

* *Numerical:* “A bike of mass 100 kg accelerates at 2 m/s². Find the force applied.”
* *Conceptual:* “Why does a balloon move forward when air is released?”

### 7. **Story/Context Hook**

Start with something like:
“Next time you’re in a bus that suddenly stops 🚍… and you fall forward, you just experienced Newton’s First Law!”
Makes it relatable instantly.

### 8. **Highlight Limitations More Simply**

Instead of just saying relativity/quantum, give a one-liner:

* *At very high speeds (like near light), Einstein takes over.*
* *At very tiny scales (atoms), quantum physics takes over.*

---

⚡ So the flow could become:

1. Hook with real-life example →
2. Concise law statement →
3. Table/diagram →
4. Application + Indian context →
5. Quiz/problem →
6. Limitation/future view.

---

👉 Want me to **make you a ready-to-use “study sheet” version** (like a one-page revision PDF with diagrams, mnemonics, examples, and a mini-quiz) for your Celestial app?
`;
