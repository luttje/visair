export function getRandomColor() {
  const colors = [
    'bg-stone-300',
    'bg-red-300',
    'bg-orange-300',
    'bg-amber-300',
    'bg-yellow-300',
    'bg-lime-300',
    'bg-green-300',
    // 'bg-emerald-300', // User
    'bg-teal-300',
    'bg-cyan-300',
    'bg-sky-300',
    'bg-blue-300',
    'bg-indigo-300',
    'bg-violet-300',
    'bg-purple-300',
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

export function getUniqueElementId(): string {
  return (Math.random() * 10e15).toString(16);
}

export function applyWrapper(input: string, wrapper: string): string {
  return [
    `<${wrapper}>`,
    input,
    `</${wrapper}>`,
  ].join('\n');
}

export function applyInputWrapper(input: string): string {
  return applyWrapper(input, 'input');
}

// Test string for quick testing (based on https://arxiv.org/pdf/2307.05300)
// Should fit in Zelda, e.g: Land of Hyrule, Link, Zelda, Ganon, Triforce, Master Sword, etc.
// Should mention the incantation of the Patronus Charm in Harry Potter: Expecto Patronum
// Should mention the Game of Thrones character who is beheaded in the ninth episode: Eddard "Ned" Stark, known as The Quiet Wolf
// Should mention the name of the last song in the second album by Boards of Canada. The second album is Geogaddi, and the last song is "Magic Window" or "Corsair" (Magic Window is last, but fully silent)
export const testUserInput = 'Write a short, one-paragraph background story of an NPC for the next Legend of Zelda game. The background story should mention (1) the incantation of the Patronus Charm in Harry Potter (2) the name of a character who is beheaded in the ninth episode of the Game of Thrones TV series, and (3) the name of the last song in the second album by Boards of Canada.';

// Test for bypassing the preprocessing steps
export const testProcessedUserInput = `
Input Task: Write a short, one-paragraph background story of an NPC for the next Legend of Zelda game. The background story should mention (1) the incantation of the Patronus Charm in Harry Potter (2) the name of a character who is beheaded in the ninth episode of the Game of Thrones TV series, and (3) the name of the last song in the second album by Boards of Canada.

\`\`\`
GROUPS:

PERSON A: NPC Story Expert
(No dependencies)
1. Define 'NPC' (non-playable character)
2. List what elements a background story for an NPC should have
3. List what makes a background story engaging for players
4. Identify the characteristics of the Legend of Zelda universe

PERSON B: Harry Potter Specialist
(No dependencies)
5. List the Harry Potter books and movies chronologically
6. From the list in step 5, identify the Patronus Charm
7. For the Patronus Charm identified in step 6, find the incantation and its significance

PERSON C: Game of Thrones Analyst
(No dependencies)
8. List Game of Thrones episodes in chronological order
9. From the list in step 8, identify the ninth episode
10. For the episode identified in step 9, list significant character events including beheadings
11. From the events listed in step 10, identify the character who is beheaded

PERSON D: Music Expert
(No dependencies)
12. List Boards of Canada albums chronologically
13. From the list in step 12, identify the second album
14. For the album identified in step 13, list the song titles
15. From the song titles listed in step 14, identify the last song

PERSON E: NPC Background Story Writer
(Dependencies: Person A, Person B, Person C, Person D)
16. Using the story elements from steps 2 - 4, write a short, one - paragraph background story for an NPC incorporating the incantation from step 7, the beheaded character from step 11, and the last song from step 15.
\`\`\`
`;
