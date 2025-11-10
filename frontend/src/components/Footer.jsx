import Button from "./Button";

export default function Footer() {
  return (
    <footer className=" text-black text-center bottom-0 lerft-0 w-full mt-10">
      <div className="grid justify-center border-b">
      <h1 className="text-black font-bold text-2xl">Empowering your digital lifestyle with the best devices at great prices.</h1>
      <Button variant="outline" className="mb-2" style={{ backgroundColor: '#D43601' }}>Contact Us</Button>
      <nav>
        <div className="">

        </div>
      </nav>
      </div>
      <p>&copy; 2025 FETTY. Tous droits réservés.</p>
    </footer>
  )
}
