import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="bg-blue-500 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">FETTY</Link>
                <div className="space-x-4">
                    <Link to="/" className="hover:underline">Home</Link>
                    <Link to="/products" className="hover:underline">Products</Link>
                </div>
            </nav>
        </header>
    )
}