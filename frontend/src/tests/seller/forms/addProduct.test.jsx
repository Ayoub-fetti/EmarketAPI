import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddProduct from "../../../pages/seller/AddProduct";
import { MemoryRouter } from "react-router-dom";
import { categoryService } from "../../../services/categoryService";

jest.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User" },
  }),
}));

jest.mock("../../../services/categoryService", () => ({
  categoryService: {
    getCategories: jest.fn().mockResolvedValue({ categories: [] }),
  },
}));

jest.mock("../../../services/productService", () => ({
  productService: {
    createProduct: jest.fn().mockResolvedValue({ success: true }),
  },
}));

const renderWithRouter = (ui) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("AddProduct Form", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Vérifier que les champs du formulaire sont rendus", async () => {
    renderWithRouter(<AddProduct />);

    expect(screen.getByLabelText(/Nom du Produit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Catégories/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prix de Vente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prix Original/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantité en Stock/i)).toBeInTheDocument();
  });

  test("Valider les champs formulaire", async () => {
    renderWithRouter(<AddProduct />);

    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalled();
    });

    userEvent.click(screen.getByRole("button", { name: /Publier le produit/i }));

    await waitFor(() => {
      expect(screen.getByText("Le titre est requis")).toBeInTheDocument();
    });

    expect(screen.getByText("La description est requise")).toBeInTheDocument();
    expect(screen.getByText("Le prix est requis")).toBeInTheDocument();
    expect(screen.getByText("Le prix d'origine est requis")).toBeInTheDocument();
    expect(screen.getByText("Le stock est requis")).toBeInTheDocument();
    expect(screen.getByText("Veuillez sélectionner au moins une catégorie")).toBeInTheDocument();
  });

  test("afficher les erreurs des valeurs négatives", async () => {
    renderWithRouter(<AddProduct />);

    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/Prix de Vente/i), { target: { value: -5 } });
    fireEvent.change(screen.getByLabelText(/Prix Original/i), { target: { value: -10 } });
    fireEvent.change(screen.getByLabelText(/Quantité/i), { target: { value: -2 } });

    userEvent.click(screen.getByRole("button", { name: /Publier/i }));

    await waitFor(() => {
      expect(screen.getByText("Le prix ne peut pas être négatif")).toBeInTheDocument();
    });

    expect(screen.getByText("Le prix d'origine ne peut pas être négatif")).toBeInTheDocument();
    expect(screen.getByText("Le stock ne peut pas être négatif")).toBeInTheDocument();
  });

  test("Validation réussie", () => {
    renderWithRouter(<AddProduct />);

    userEvent.type(screen.getByLabelText(/Nom du Produit/i), "Produit test");
    userEvent.type(screen.getByLabelText(/Description/i), "Description test");
    userEvent.type(screen.getByLabelText(/Prix de Vente/i), "99");
    userEvent.type(screen.getByLabelText(/Prix Original/i), "120");
    userEvent.type(screen.getByLabelText(/Quantité/i), "20");

    userEvent.click(screen.getByLabelText(/Catégories/i));

    userEvent.click(screen.getByRole("button", { name: /Publier le produit/i }));

    expect(screen.queryByText(/requis/)).toBeNull();
    expect(screen.queryByText(/négatif/)).toBeNull();
  });

  test("Validation upload images", () => {
    renderWithRouter(<AddProduct />);

    const file = new File(["img"], "img.png", { type: "image/png" });

    userEvent.upload(screen.getByLabelText(/Image Principale/i), file);

    userEvent.click(screen.getByRole("button", { name: /Publier le produit/i }));

    expect(screen.queryByText(/requis/)).toBeNull();
  });
});
