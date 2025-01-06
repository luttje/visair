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
