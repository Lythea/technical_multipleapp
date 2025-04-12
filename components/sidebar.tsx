// components/sidebar.tsx

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4 space-y-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Multiple Apps</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/user/foodreview" className="block hover:text-red-400">
            🍔 Food Review
          </Link>
        </li>
        <li>
          <Link
            href="/user/pokemonreview"
            className="block hover:text-yellow-400"
          >
            🐱‍👤 Pokemon Review
          </Link>
        </li>
        <li>
          <Link
            href="/user/markdownnotes"
            className="block hover:text-green-400"
          >
            📝 Markdown Notes
          </Link>
        </li>
      </ul>
    </div>
  );
}
