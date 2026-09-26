# Frame - AI Content Studio

A hackathon prototype for Problem 3, "AI Content Studio & Multi-Platform Command Center". This project was developed with AI assistance and should be presented honestly as such. It is not an official hoichoi product or a live publisher.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add a Gemini API key in `.env.local` to enable AI generation and AI reports. Without it, generation errors clearly rather than showing fabricated AI results. Vercel can host this Next.js app on its free plan with `GEMINI_API_KEY` set in project environment variables. The key is kept server-side; never commit it.

## Workflow

1. Enter a Bengali or English title brief. Gemini generates three channel-specific creative concepts, bilingual copy, visual treatment and a native SVG poster for each. SVG designs are distinct by channel, with different compositions and palette.
2. Review, discard and regenerate until satisfied. A post cannot schedule without explicit human approval. Approval clears on any retry or edit.
3. Schedule into a mock publisher. Adapter enforces copy limits and creative aspect ratio, SVG byte size and file type before accepting. Simulate publish and ingest sample metrics with a deterministic seeded model labelled as simulated, never live engagement.
4. Compare the same campaign across Instagram, YouTube and X. Gemini writes a weekly insight memo citing exact post IDs. Reuse an insight to prefill the next brief.

## Limitations

Mock publisher only. Metrics are synthetic, not connected to social APIs. Data persists in the current browser via localStorage, so another judge/browser starts with a fresh workspace. SVG creative is an original generated layout driven by distinct AI art direction, not a photorealistic image model output or real video generation. Live generation/report requests require network access and a configured Gemini key. No copyrighted hoichoi title assets are included.
