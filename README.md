# Food4U Project

---

## 🌟 **Inspiration**
Someone special to me is affected by dietary food restrictions. I noticed the quality of service at many restaurants needs great improvement when it comes to accommodating such a diverse community of individuals. As someone who doesn't prefer onions myself, I too find it difficult to get my meal made correctly the first time. The future of this application is to **hold businesses accountable** for providing a quality experience. Time is money, and I cannot afford a remake on my lunch break. :')

---

## 🍽️ **What it Does**
Generates a meal based on user preferences such as diet or allergy. We intake medical information such as ICD-10-CM codes and use that to query a food suggestion from the Gemini API. Though a simplistic approach, this is what made it to the submission. The original idea considered much deeper analysis for a fine-tuned quality response.

---

## 🛠️ **How We Built It**

### Frontend (Server 1):
- **Framework**: Cloudflare Remix-Run SDK for a fast full-stack app.
- **Database**: D1 SQLite DB for user accounts, KV storages for session management.
- **Authentication**: JWT token exchange between Server 1 and Server 2 for validation and authentication.
- **Tech Stack**: React with React Hook Form and Zod for validation, React Context, and LocalStorage for user progress persistence.

This modular approach with React helps with **scalability** and **reusability**. The balance between speed and flexibility ensures that **Food4U** is optimized to be data-portable, secure, and scalable.

### Backend (Server 2):
- **Framework**: Python FastAPI for logic and meal generation.
- **External APIs**: Google API, Spoonacular, FoodDataCentral, CockroachDB, Qdrant, LLamindex, Gemini.
- **AI Food Recommendation**: Data from questions is used to generate optimal results and improve user queries.

### Database:
- **Profile**: Holds user data.
- **Medical History**: Stores the user's medical profile.
- **Attributes**: Tracks dietary preferences.
- **Diet Profile**: Used for personalized meal suggestions.

The original database design dynamically fills itself as users make queries, allowing for a **progressive and personalized experience**. What you see here is a minimalist approach due to the time and resources invested in the project.

### Deployment:
- **Frontend**: Deployed via Cloudflare SDK for quick and secure updates.
- **Backend**: Hosted on Render.com with whitelisted secure connections between servers.

### Why 2 Servers?
For **speed, affordability**, and **flexibility** during team creation and separation of duties with respect to everyone's expertise.

---

## 🚧 **Challenges We Ran Into**
- Contribution: We started with 5, but I was the last man standing. **The show must go on.**
- Feature Creep: In the initial stages, there were many good ideas, but it became clear over time that some participants were not capable or qualified to execute their parts, contrary to their introductions.
- Deployment: The Vite dev environment worked like a charm, but issues arose with Wrangler and Cloudflare's proxy handling my own API requests. You don't want to `response.json()` too many times in a single request, haha.
- Closing async sessions and avoiding multiple sessions on a single instance—no leaks. This error haunted me throughout the project.
- Motivation: There were long... long nights. I almost called it quits two nights before the deadline. Then I spoke to my close friend, and the flame was reignited. The reason I began this project.

---

## 🏆 **Accomplishments**
- **Improving the restaurant experience** for those with dietary restrictions.
- **Persistence**: Pushing through as a one-man army.
- **Completed my First Hackathon**
- Paving the way to standardize how restaurants accommodate dietary restrictions—locally, then nationally, and then globally.

---

## 📚 **What We Learned**
- More aggressive feature branching helps maintain focus on **User Stories**.
- Dedicate time to documentation. It's a MUST.
- Balancing leadership with camaraderie.
- Speed: Every opportunity to build a full-stack app is a race against time—_challenge accepted_, of course.
- ICD-10-CM codes are unique identifiers used to classify medical conditions.
- Machine learning is more than just an API request to ChatGPT. Vector stores, deep variable analysis, and prompt engineering are required for a successful narrow AI project. This project uses general AI.

---

## 🚀 **What's Next for Food4U**
1. **Improving user experience** through fine-tuned AI suggestions based on medical conditions and datasets.
2. Collaborating with **delivery apps** like DoorDash or UberEats to ensure restaurants deliver accurate orders.
3. Providing **documentation to protect customers** from incorrect meals, reducing the risk of disruptions in their day.
4. The UI can always use a clean-up, as well as pushing the limits on unique, user-friendly, and stylish GUIs for our users.

Ultimately, this app aims to help anyone with dietary restrictions and others like them—like me, the guy who doesn't like onions. Those affected by dietary restrictions often struggle to find safe and enjoyable dining experiences. In that process, time and energy are spent clarifying and double-checking to ensure the food was made properly. Restaurants need to pay more attention to this vital issue, and **Food4U** will help lead that change.
