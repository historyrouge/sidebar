
/**
 * @fileoverview This file contains training data examples for the AI assistant.
 * The content here is used to guide the AI on the desired style and structure of its responses.
 * This file is intended to be temporary and can be removed after the AI has been "trained".
 */

// Example 1: Comparing Domain Registrars
const domainComparisonTraining = `
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
const chemicalDecompositionTraining = `
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




CaCO_3 \\xrightarrow{\\Delta} CaO + CO_2

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
const aiModelTrainingData = `
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
