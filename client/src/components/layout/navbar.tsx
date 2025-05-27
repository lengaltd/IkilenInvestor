import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Wallet, Menu, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Wallet className="text-primary-800 h-6 w-6 mr-2" />
              <span className="font-bold text-xl text-primary-800">IKILEN</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link 
                href="/dashboard"
                className={`${
                  location === "/dashboard" 
                    ? "border-primary-800 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Dashboard
              </Link>
              <Link 
                href="/investments"
                className={`${
                  location === "/investments"
                    ? "border-primary-800 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Investments
              </Link>
              <Link 
                href="/history"
                className={`${
                  location === "/history"
                    ? "border-primary-800 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                History
              </Link>
              <Link 
                href="/members"
                className={`${
                  location === "/members"
                    ? "border-primary-800 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Members
              </Link>
              <Link 
                href="/settings"
                className={`${
                  location === "/settings"
                    ? "border-primary-800 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Settings
              </Link>
            </div>
          </div>
          {user ? (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-800 focus:ring-offset-2"
              >
                <Info className="h-5 w-5" />
              </Button>
              
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <Avatar>
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block ml-3 text-sm font-medium text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => logout()}
                    className="hidden md:block ml-3 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Logout
                  </Button>
                </div>
              </div>
              
              <div className="ml-4 md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-800"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link 
                href="/register"
                className="bg-primary-800 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            href="/dashboard"
            className={`${
              location === "/dashboard"
                ? "bg-primary-50 border-primary-800 text-primary-800"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Dashboard
          </Link>
          <Link 
            href="/investments"
            className={`${
              location === "/investments"
                ? "bg-primary-50 border-primary-800 text-primary-800"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Investments
          </Link>
          <Link 
            href="/history"
            className={`${
              location === "/history"
                ? "bg-primary-50 border-primary-800 text-primary-800"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            History
          </Link>
          <Link 
            href="/members"
            className={`${
              location === "/members"
                ? "bg-primary-50 border-primary-800 text-primary-800"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Members
          </Link>
          <Link 
            href="/settings"
            className={`${
              location === "/settings"
                ? "bg-primary-50 border-primary-800 text-primary-800"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Settings
          </Link>
          {user && (
            <button
              onClick={() => logout()}
              className="w-full text-left border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
