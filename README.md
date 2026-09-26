<div align="center">

# frame.

### One story. Everywhere it matters.

**An AI-native content studio for regional streaming, built for the hoichoi Hackathon '26.**

[Live experience](https://frame-ai-content-studio.vercel.app/) · [Interactive guide](https://frame-ai-content-studio.vercel.app/guide) · [Open the studio](https://frame-ai-content-studio.vercel.app/studio)

</div>

---

Frame is a working prototype for **Problem 3: AI Content Studio & Multi-Platform Command Center**. Give it a title, audience and story hook. It creates three different visual and copy directions for Instagram, YouTube and X, asks for your approval, simulates publishing, then turns *labelled synthetic data* into a cited next-campaign insight.

> Built with AI assistance by Anurag Roy. Independent hackathon prototype, not an official hoichoi product. No real social accounts or analytics are connected.

## Experience at a glance

| Route | What happens |
| --- | --- |
| `/` | Cinematic, motion-led landing page with a 3D-style CSS scene and a public demo entrance. |
| `/guide` | Five interactive chapters, from the first brief to the next creative decision. |
| `/signup` and `/login` | Supabase Email sign-up and sign-in. Email confirmation is enabled. |
| `/studio` | The live creative workflow. Judges can explore without creating an account. |

## The loop

```text
Story brief
  ↓
AI-generated concepts → Instagram / YouTube / X
  ↓
Review, edit, discard or retry → explicit human approval
  ↓
Validate → mock queue → simulate publish
  ↓
Synthetic post metrics → normalized comparison
  ↓
AI weekly memo with exact post-ID citations
  ↳ Bring the next hypothesis into a fresh brief
```

- **Made for each channel:** Distinct art direction and platform-specific Bengali and English copy; three generated SVG layouts, not one image cropped three times.
- **A real approval gate:** Drafts cannot enter the queue without review. Editing a caption resets it to draft.
- **A rejecting adapter:** Copy length, image aspect ratio, MIME type and byte size are checked before mock scheduling or publishing.
- **A traceable feedback loop:** Reports cite post IDs, compare engagement and CTR against impressions, and feed a specific hypothesis into the next brief.

## Run it locally

**Prerequisites:** Node.js 20+ and npm. To exercise live AI generation and reports, get an API key for Google's Gemini 2.5 Flash model. To exercise sign-up/sign-in, create a free Supabase project with Email auth enabled. The public demo interface still loads without either service, but generation and account creation will not work until configured.

1. **Clone and install:**

   ```bash
   git clone https://github.com/AnuragRoy485/frame-ai-content-studio.git
   cd frame-ai-content-studio
   npm install
   ```

2. **Create the local environment file:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in the values:

   ```dotenv
   GEMINI_API_KEY=your_google_ai_studio_key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

   `GEMINI_API_KEY` stays on the server. Supabase's **publishable** key is intended for the browser; never put the Supabase secret/service-role key or database password in the public environment variables or Git.

3. **Configure Supabase Auth (if using accounts):** In the Supabase dashboard, enable the Email provider and allow new sign-ups. Under **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/studio` as an allowed redirect URL. Keep email confirmation enabled if you want the same behaviour as production. The hosted instance uses `https://frame-ai-content-studio.vercel.app` and `/studio` instead.

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). To try the whole flow, select **Open the studio → Load sample brief → Generate campaign**, approve the three concepts, then use Publisher and Insights. Sign-up and login are optional for this judge-friendly prototype.

5. **Check the production build locally:**

   ```bash
   npm run build
   npm start
   ```

## Deploy on Vercel

Import this repository as a Next.js project, then set `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in project environment variables. Redeploy after changing environment variables. Add the production domain and `/studio` to your Supabase Auth URL configuration. Do **not** commit `.env.local`; it is ignored by Git.

## Tech and boundaries

Next.js 15, React 19, TypeScript, Supabase Auth, server-side model requests, generated SVG compositions and CSS motion. The published metrics are deterministic demo values, not a claim about a real audience. Workspace drafts, posts and reports are saved in the current browser's `localStorage`, **not synced to the Supabase user account**. The posters are original graphic studies driven by AI art direction, not photorealistic image generation or video. No copyrighted title assets or social-network posting permissions are used.

---

<div align="center">

**Made by [Anurag Roy](https://anuragroy.tech)**

</div>
