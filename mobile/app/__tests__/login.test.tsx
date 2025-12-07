import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../(auth)/login";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

// ==== MOCKS ====
jest.mock("../../contexts/AuthContext");
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("LoginScreen", () => {
  let mockLogin;
  let mockReplace;
  let mockPush;

  beforeEach(() => {
    mockLogin = jest.fn();
    mockReplace = jest.fn();
    mockPush = jest.fn();

    useAuth.mockReturnValue({
      login: mockLogin,
    });

    useRouter.mockReturnValue({
      replace: mockReplace,
      push: mockPush,
    });
  });

  // -------------------------------
  test("renderiza inputs y botón correctamente", () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText("Cédula")).toBeTruthy();
    expect(getByPlaceholderText("Contraseña")).toBeTruthy();
    expect(getByText("Iniciar sesión")).toBeTruthy();
  });

  // -------------------------------
  test("permite escribir en los campos", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    const ciInput = getByPlaceholderText("Cédula");
    const pwdInput = getByPlaceholderText("Contraseña");

    fireEvent.changeText(ciInput, "12345678");
    fireEvent.changeText(pwdInput, "password123");

    expect(ciInput.props.value).toBe("12345678");
    expect(pwdInput.props.value).toBe("password123");
  });

  // -------------------------------
  test("login exitoso navega a /home", async () => {
    mockLogin.mockResolvedValueOnce(); // login OK

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Cédula"), "123");
    fireEvent.changeText(getByPlaceholderText("Contraseña"), "abc");

    fireEvent.press(getByText("Iniciar sesión"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("123", "abc");
      expect(mockReplace).toHaveBeenCalledWith("/(main)/home");
    });
  });

  // -------------------------------
  test("login fallido muestra mensaje de error", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    const { getByText, getByPlaceholderText, findByText } = render(
      <LoginScreen />
    );

    fireEvent.changeText(getByPlaceholderText("Cédula"), "123");
    fireEvent.changeText(getByPlaceholderText("Contraseña"), "wrong");

    fireEvent.press(getByText("Iniciar sesión"));

    const errorText = await findByText("Credenciales inválidas");
    expect(errorText).toBeTruthy();
  });

  // -------------------------------
  test("link ¿Olvidaste tu contraseña? navega a la ruta correcta", () => {
    const { getByText } = render(<LoginScreen />);

    const forgotLink = getByText("¿Olvidaste tu contraseña?");
    fireEvent.press(forgotLink);

    expect(mockPush).toHaveBeenCalledWith("/forgot-password");
  });
});
