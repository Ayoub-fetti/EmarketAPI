import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProductsTable from "../../../components/seller/ProductsTable";
import { productService } from "../../../services/productService";

jest.mock("../../../services/productService", () => ({
  productService: {
    deleteProduct: jest.fn().mockResolvedValue({ success: true }),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (ui) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

const mockProducts = [
  {
    _id: "1",
    title: "Produit Test 1",
    price: 99.99,
    stock: 50,
    sales: 10,
    published: true,
    categories: [
      { name: "Électronique" },
      { name: "Smartphones" },
      { name: "Accessoires" },
    ],
  },
  {
    _id: "2",
    title: "Produit Test 2",
    price: 149.5,
    stock: 0,
    published: false,
    categories: [],
  },
];

describe("ProductsTable Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Affiche les produits dans le tableau", () => {
    renderWithRouter(<ProductsTable products={mockProducts} />);

    expect(screen.getByText("Produit Test 1")).toBeInTheDocument();
    expect(screen.getByText("99.99 DH")).toBeInTheDocument();
    expect(screen.getByText("● Publié")).toBeInTheDocument();
  });

  test("Navigation vers la page de détails du produit", async () => {
    renderWithRouter(<ProductsTable products={mockProducts} />);

    const viewButtons = screen.getAllByTitle("Voir");
    await userEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/seller/products/1");
  });

  test("Ouvre et ferme le modal de suppression", async () => {
    renderWithRouter(<ProductsTable products={mockProducts} />);

    const deleteButtons = screen.getAllByTitle("Supprimer");
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Êtes-vous sûr de vouloir supprimer/i)
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /Annuler/i });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/Êtes-vous sûr de vouloir supprimer/i)
      ).not.toBeInTheDocument();
    });
  });

  test("Supprime un produit avec succès", async () => {
    const mockOnProductDeleted = jest.fn();

    renderWithRouter(
      <ProductsTable
        products={mockProducts}
        onProductDeleted={mockOnProductDeleted}
      />
    );

    const deleteButtons = screen.getAllByTitle("Supprimer");
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Êtes-vous sûr de vouloir supprimer/i)
      ).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole("button", {
      name: /Supprimer/i,
    });
    const confirmButton = confirmButtons[confirmButtons.length - 1];
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(productService.deleteProduct).toHaveBeenCalledWith("1");
      expect(mockOnProductDeleted).toHaveBeenCalledWith("1");
    });
  });
});
