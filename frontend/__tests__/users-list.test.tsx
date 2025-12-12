import { render, screen, within, waitFor, fireEvent } from "@testing-library/react";
import UsersListPage from "../app/(logged)/admin/users/page"; 
import { useAuth } from "@/hooks/useAuth";
import { userController } from "@/controllers/userController";

jest.mock("@/hooks/useAuth");
jest.mock("@/controllers/userController");

describe("UsersListPage", () => {

  const mockUsers = [
    {
      ci: "12345678",
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "ADMIN",
      description: "Administrador del sistema",
      pictureUrl: null
    },
    {
      ci: "87654321",
      name: "Ana López",
      email: "ana@example.com",
      role: "PROFESOR",
      description: "Profesora de matemática",
      pictureUrl: null
    },
    {
      ci: "55555555",
      name: "Pedro Gómez",
      email: "pedro@example.com",
      role: "ESTUDIANTE",
      description: null,
      pictureUrl: null
    }
  ];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      accessToken: "fake-token"
    });

    (userController.getUsers as jest.Mock).mockResolvedValue({
      success: true,
      data: mockUsers
    });
  });

  test("muestra la lista de usuarios correctamente", async () => {
    render(<UsersListPage />);

    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana López")).toBeInTheDocument();
    expect(screen.getByText("Pedro Gómez")).toBeInTheDocument();
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    const row = screen.getByText("Pedro Gómez").closest("tr");  
    expect(within(row!).getByText(/estudiante/i)).toBeInTheDocument();

  });


  test("filtra usuarios por búsqueda", async () => {
    render(<UsersListPage />);

    await screen.findByText("Juan Pérez");

    const input = screen.getByLabelText("Buscar");

    fireEvent.change(input, { target: { value: "ana" } });

    expect(await screen.findByText("Ana López")).toBeInTheDocument();

    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
    expect(screen.queryByText("Pedro Gómez")).not.toBeInTheDocument();
  });

  test("muestra mensaje cuando no hay usuarios", async () => {
    (userController.getUsers as jest.Mock).mockResolvedValue({
      success: true,
      data: []
    });

    render(<UsersListPage />);

    const message = await screen.findByText("No hay usuarios registrados");
    expect(message).toBeInTheDocument();
  });

  test("muestra conteo de roles correctamente", async () => {
    render(<UsersListPage />);

    await screen.findByText("Juan Pérez");

    expect(screen.getByText("Admin: 1")).toBeInTheDocument();
    expect(screen.getByText("Profesores: 1")).toBeInTheDocument();
    expect(screen.getByText("Estudiantes: 1")).toBeInTheDocument();
  });
});
