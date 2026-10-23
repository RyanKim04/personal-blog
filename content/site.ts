// Site-wide content. Fill the [bracketed] placeholders before launch (SPEC §3).
export const site = {
  name: "Ryan Kim",
  // Ordered; `id` must match a post's `category` frontmatter.
  categories: [
    { id: "Statistics", label: "Statistics" },
    { id: "Machine learning", label: "Machine learning" },
    { id: "Essay", label: "Essays" },
  ],
  profile: {
    name: "Ryan Kim",
    bio: "[One or two lines on what you work on and what you write about.]",
    avatar: null as string | null, // e.g. "/avatar.jpg" in public/
    email: "[email@example.com]",
    links: [
      { label: "GitHub", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
    experience: [
      { role: "[Role]", org: "[Company]", years: "[2024–now]" },
      { role: "[Role]", org: "[Company]", years: "[2022–24]" },
    ],
    education: [{ role: "[Degree]", org: "[School]", years: "[2022]" }],
  },
} as const;
