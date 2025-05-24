import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link href="#">
              <a className="text-base text-gray-500 hover:text-gray-900">About</a>
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#">
              <a className="text-base text-gray-500 hover:text-gray-900">FAQ</a>
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#">
              <a className="text-base text-gray-500 hover:text-gray-900">Contact</a>
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#">
              <a className="text-base text-gray-500 hover:text-gray-900">Terms</a>
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#">
              <a className="text-base text-gray-500 hover:text-gray-900">Privacy</a>
            </Link>
          </div>
        </nav>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} IKILEN Investment Group. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
