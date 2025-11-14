import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../../app/login/components/login-form";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// 🧩 Mocks de dependencias externas
jest.mock('@/public/assets/icons/mentora-logo.svg', () => 'MockedLogo');

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  getSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));


describe("LoginForm", () => {
  
  const pushMock = jest.fn();
  const forgotPasswordMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  test("muestra error si los campos están vacíos", async () => {
    render(<LoginForm onForgotPassword={forgotPasswordMock} />);

    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/la cédula es requerida/i)).toBeInTheDocument();
  });

  test("muestra error si las credenciales son incorrectas", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" });

    render(<LoginForm onForgotPassword={forgotPasswordMock} />);

    await userEvent.type(screen.getByPlaceholderText(/ingresa tu cédula/i), "12345678");
    await userEvent.type(screen.getByPlaceholderText(/ingresa tu contraseña/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText(/credenciales incorrectas/i)).toBeInTheDocument();
  });

  test("redirige al home si el login es exitoso", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
    (getSession as jest.Mock).mockResolvedValue({ user: { name: "Test" } });

    render(<LoginForm onForgotPassword={forgotPasswordMock} />);

    await userEvent.type(screen.getByPlaceholderText(/ingresa tu cédula/i), "12345678");
    await userEvent.type(screen.getByPlaceholderText(/ingresa tu contraseña/i), "1234");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  test("llama a onForgotPassword al hacer clic en el enlace", async () => {
    render(<LoginForm onForgotPassword={forgotPasswordMock} />);

    const link = screen.getByRole("link", { name: /olvidaste tu contraseña/i });
    await userEvent.click(link);

    expect(forgotPasswordMock).toHaveBeenCalled();
  });
});
