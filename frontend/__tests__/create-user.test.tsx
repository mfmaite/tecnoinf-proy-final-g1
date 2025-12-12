import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateUserForm from "../app/(logged)/admin/users/components/create-user-form";
import { userController } from "@/controllers/userController";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import userEvent from "@testing-library/user-event";

// 🧩 Mocks de dependencias externas

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useAuth");
jest.mock("@/controllers/userController");

describe("CreateUserForm", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    (useAuth as jest.Mock).mockReturnValue({
      accessToken: "fake-token",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

test("muestra error si falta la cédula", async () => {
    render(<CreateUserForm />);

    const submitButton = screen.getByRole("button", { name: "Crear Usuario" });
    await userEvent.click(submitButton);

    expect(await screen.findByText("La cédula es requerida")).toBeInTheDocument();
  });

  test("muestra error si falta el nombre", async () => {
    render(<CreateUserForm />);

    fireEvent.change(screen.getByLabelText("Cédula"), {
      target: { value: "12345678" },
    });

    await userEvent.click(screen.getByRole("button", { name: "Crear Usuario" }));

    expect(await screen.findByText("El nombre es requerido")).toBeInTheDocument();
  });

  test("muestra error si falta el email", async () => {
    render(<CreateUserForm />);

    fireEvent.change(screen.getByLabelText("Cédula"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Nombre Completo"), { target: { value: "Test" } });

    await userEvent.click(screen.getByRole("button", { name: "Crear Usuario" }));

    expect(await screen.findByText("El email es requerido")).toBeInTheDocument();
  });

  test("muestra error si la contraseña tiene menos de 8 caracteres", async () => {
    render(<CreateUserForm />);

    fireEvent.change(screen.getByLabelText("Cédula"), { value: "1", target: { value: "123" } });
    fireEvent.change(screen.getByLabelText("Nombre Completo"), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "123" } });

    await userEvent.click(screen.getByRole("button", { name: "Crear Usuario" }));

    expect(
      await screen.findByText("La contraseña debe tener al menos 8 caracteres")
    ).toBeInTheDocument();
  });

  test("muestra mensaje de éxito cuando la creación es exitosa", async () => {
    (userController.createUser as jest.Mock).mockResolvedValue({
      success: true,
      message: "Usuario creado correctamente",
    });

    render(<CreateUserForm />);

    fireEvent.change(screen.getByLabelText("Cédula"), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText("Nombre Completo"), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "12345678" } });

    await userEvent.click(screen.getByRole("button", { name: "Crear Usuario" }));

    expect(
      await screen.findByText("Usuario creado correctamente")
    ).toBeInTheDocument();
  });

  test("muestra mensaje de error si createUser devuelve error", async () => {
    (userController.createUser as jest.Mock).mockResolvedValue({
      success: false,
      message: "Error creando usuario",
    });

    render(<CreateUserForm />);

    fireEvent.change(screen.getByLabelText("Cédula"), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText("Nombre Completo"), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "12345678" } });

    await userEvent.click(screen.getByRole("button", { name: "Crear Usuario" }));

    expect(
      await screen.findByText("Error creando usuario")
    ).toBeInTheDocument();
  });

  test("redirige al listado al presionar Cancelar", async () => {
    render(<CreateUserForm />);

    const cancelBtn = screen.getByText("Cancelar");

    await userEvent.click(cancelBtn);

    expect(mockPush).toHaveBeenCalledWith("/admin/users");
  });

  test("al hacer click en la vista de contraseña la muestra o no", async () => {
    render(<CreateUserForm />);

    const passwordInput = screen.getByLabelText("Contraseña");
    expect(passwordInput).toHaveAttribute("type", "password");

    const iconButton = passwordInput.parentElement!.querySelector("svg")!;
    await userEvent.click(iconButton);

    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
