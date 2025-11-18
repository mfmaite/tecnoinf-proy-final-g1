// Este tab NO es una pantalla real.
// Es solo para que Tabs lo registre.
// Impedimos que sea navegable.

export default function CoursesTab() {
  return null;
}

// Evita hidratación o navegación accidental
export const dynamic = "force-static";
