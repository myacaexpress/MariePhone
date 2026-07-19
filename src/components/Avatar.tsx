"use client";

/** Apple-style contact avatar: gray gradient circle with a white silhouette,
 *  or initials when a real name is available. */
export default function Avatar({
  name,
  size = 40,
}: {
  name?: string;
  size?: number;
}) {
  // Initials only for names that aren't phone numbers.
  const initials =
    name && /[a-zA-Z]/.test(name)
      ? name
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : null;

  return (
    <div
      className="flex shrink-0 select-none items-center justify-center rounded-full text-white"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(180deg, #9ba3af 0%, #7d8593 100%)",
        fontSize: size * 0.4,
        fontWeight: 500,
      }}
      aria-hidden
    >
      {initials ?? (
        <svg
          width={size * 0.55}
          height={size * 0.55}
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M12 12c2.7 0 4.8-2.2 4.8-4.9S14.7 2.3 12 2.3 7.2 4.4 7.2 7.1 9.3 12 12 12Zm0 2.2c-3.6 0-7.6 1.9-7.6 4.5v1.5c0 .8.6 1.4 1.4 1.4h12.4c.8 0 1.4-.6 1.4-1.4v-1.5c0-2.6-4-4.5-7.6-4.5Z" />
        </svg>
      )}
    </div>
  );
}
