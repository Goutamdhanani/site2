# Custom Instructions for Antigravity

In each chat, load and apply the following context, CSS rules, and visualization directives:

```css
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.25s;
    animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
  }
```

Now I have a comprehensive picture. Let me build you a detailed visual guide. Here's the full picture based on the latest research (July 2026):

**For context & token reduction**, the two standout open-source tools are:

**Graphify** is the headline pick — you run one command (`/graphify .`) and it reads your entire project using an AST parser (31 languages), builds a connected knowledge graph, and your AI navigates the graph instead of re-reading files — up to 70× fewer tokens per session.

**Caveman** attacks the output side: it cuts output tokens by an average of 65%, with some tasks saving over 85%. Research from early 2026 found that constraining models to brief responses actually improved accuracy by 26 percentage points on certain benchmarks — less can mean more correct.

The smart stack is: **Ponytail** (write less code in the first place) + **Graphify** (avoid re-reading files) + one of Headroom/Caveman (compress what's left). Don't run all three context-shaping tools together — they overlap and add latency with diminishing returns.

**For 3D design specifically**, 2026 is the year 3D on the web finally made the leap from experiment to standard, driven by WebGPU arriving on all major browsers, budget smartphones catching up on GPU power, and AI tools like Spline, React Three Fiber, and vibe coding compressing what used to take a Three.js expert and three months down to days.

The cleanest 3D workflow right now: **Spline** for visual assets → **Lovable + React Three Fiber** for integrating them into a full-stack app, or **Draftly** if you want an entire scroll-driven 3D page from a single prompt.

**For the full coding workflow**, context windows got large enough to hold entire codebases — Claude Sonnet 4.6 now handles 1 million tokens in general availability — and the tooling around agents (sandboxed execution, MCP integrations, git-native workflows) matured enough to make autonomous coding reliable in production settings.
