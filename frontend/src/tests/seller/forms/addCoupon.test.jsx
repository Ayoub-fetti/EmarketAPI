import { render, screen, fireEvent, waitFor }from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from "react-router-dom";
import AddCoupon from '../../../pages/seller/AddCoupon';

jest.mock('../../../services/couponService', () => ({
    couponService: {
       createCoupon: jest.fn().mockResolvedValue()
    }
}))

const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AddCoupon Form', () => {

  beforeEach( () => jest.clearAllMocks());

  test('Vérifier que les champs du formulaire sont rendus', () => {
     
    renderWithRouter(<AddCoupon/>);

    expect(screen.getByLabelText(/Code du coupon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type_reduction/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valeur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Achat minimum \(DH\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date de début/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date d'expiration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Utilisation maximale totale/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Utilisation maximale par utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Statut/i)).toBeInTheDocument();  

  });

  test('Valider remplit de tous les champs de formulaire', async () => {
    renderWithRouter(<AddCoupon/>);

    userEvent.click(screen.getByRole('button', { name: /Créer le coupon/i }));

    await waitFor(() => {
      expect(screen.getByText("Le code est requis")).toBeInTheDocument();
    });

    expect(screen.getByText("La valeur est requise")).toBeInTheDocument();
    expect(screen.getByText("La date de début est requise")).toBeInTheDocument();
    expect(screen.getByText("La date d'expiration est requise")).toBeInTheDocument();

  });

  test('Affiche des erreurs de validation - code court et valeur négative', async () => {
   renderWithRouter(<AddCoupon/>);

 
   await userEvent.type(screen.getByLabelText(/Code du coupon/i), "test");
   await userEvent.type(screen.getByLabelText(/Valeur/i), "-10");

   await userEvent.click(screen.getByRole('button', { name: /Créer le coupon/i}));


    await waitFor(() => {
    expect(screen.getByText("Le code doit contenir au moins 6 caractères")).toBeInTheDocument();
  });
 
   expect(screen.getByText("La valeur doit être positive")).toBeInTheDocument();

  });

  test('Affiche une erreur si le pourcentage dépasse 100', async () => {

   renderWithRouter(<AddCoupon/>);

   await userEvent.type(screen.getByLabelText(/Valeur/i), "120");

   userEvent.click(screen.getByRole('button', { name: /Créer le coupon/i}));

   await waitFor(() => {
    expect(screen.getByText("Le pourcentage ne peut pas dépasser 100")).toBeInTheDocument();
   });

  });

  test("Affiche une erreur de la date d'expiration", async () => {
  renderWithRouter(<AddCoupon />);

  userEvent.type(screen.getByLabelText(/Code du coupon/i), "ABCDEF");
  userEvent.type(screen.getByLabelText(/Valeur/i), "10");
  userEvent.type(screen.getByLabelText(/Date de début/i), "2025-01-01T10:00");

  userEvent.click(screen.getByRole('button', { name: /Créer le coupon/i }));

  await waitFor(() => {
    expect(screen.getByText("La date d'expiration est requise")).toBeInTheDocument();
  });
});

})


    


