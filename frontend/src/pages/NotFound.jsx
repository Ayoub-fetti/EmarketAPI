
export default function NotFound(){
    return (
        <main class="flex items-center justify-center h-screen text-white">
        <div class="text-center">
            <h1 class="text-8xl font-bold text-[#D43601]">404</h1>
            <p class=" text-black text-2xl mt-4 font-semibold">Page Not Found</p>
            <p class="text-black mt-2">Sorry, the page you’re looking for doesn’t exist or has been moved.</p>
            <a href="/" class="mt-6 inline-block px-6 py-3 bg-[#D43601] text-white font-medium rounded-md hover:bg-orange-600 transition">
            Go Home
            </a>
        </div>
        </main>
    );
}